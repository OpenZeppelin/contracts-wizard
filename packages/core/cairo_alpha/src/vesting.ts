import type { BaseImplementedTrait, Contract } from './contract';
import { ContractBuilder } from './contract';
import { contractDefaults as commonDefaults } from './common-options';
import { setAccessControl } from './set-access-control';
import { setUpgradeable } from './set-upgradeable';
import type { Info } from './set-info';
import { setInfo } from './set-info';
import { defineComponents } from './utils/define-components';
import { printContract } from './print';
import { OptionsError } from './error';
import { durationToTimestamp } from './utils/duration';
import { toUint, validateUint } from './utils/convert-strings';

export type VestingSchedule = 'linear' | 'custom';

export const defaults: Required<VestingOptions> = {
  name: 'VestingWallet',
  startDate: '',
  duration: '0 day',
  cliffDuration: '0 day',
  schedule: 'custom',
  info: commonDefaults.info,
} as const;

export function printVesting(opts: VestingOptions = defaults): string {
  return printContract(buildVesting(opts));
}

export interface VestingOptions {
  name: string;
  startDate: string;
  duration: string;
  cliffDuration: string;
  schedule: VestingSchedule;
  info?: Info;
}

function withDefaults(opts: VestingOptions): Required<VestingOptions> {
  return {
    name: opts.name ?? defaults.name,
    startDate: opts.startDate ?? defaults.startDate,
    duration: opts.duration ?? defaults.duration,
    cliffDuration: opts.cliffDuration ?? defaults.cliffDuration,
    schedule: opts.schedule ?? defaults.schedule,
    info: opts.info ?? defaults.info,
  };
}

export function buildVesting(opts: VestingOptions): Contract {
  const c = new ContractBuilder(opts.name);
  const allOpts = withDefaults(opts);

  addBase(c, opts);
  addSchedule(c, opts);
  setInfo(c, allOpts.info);

  // Vesting component depends on Ownable component
  const access = 'ownable';
  setAccessControl(c, access);

  // Must be non-upgradable to guarantee vesting according to the schedule
  setUpgradeable(c, false, access);

  return c;
}

function addBase(c: ContractBuilder, opts: VestingOptions) {
  c.addUseClause('starknet', 'ContractAddress');
  const startDate = getVestingStart(opts);
  const totalDuration = getVestingDuration(opts);
  const cliffDuration = getCliffDuration(opts);
  validateDurations(totalDuration, cliffDuration);
  if (startDate !== undefined) {
    c.addConstant({
      name: 'START',
      type: 'u64',
      value: startDate.timestampInSec.toString(),
      comment: startDate.formattedDate,
      inlineComment: true,
    });
  } else {
    c.addConstant({
      name: 'START',
      type: 'u64',
      value: '0',
    });
  }
  c.addConstant({
    name: 'DURATION',
    type: 'u64',
    value: totalDuration.toString(),
    comment: opts.duration,
    inlineComment: true,
  });
  c.addConstant({
    name: 'CLIFF_DURATION',
    type: 'u64',
    value: cliffDuration.toString(),
    comment: opts.cliffDuration,
    inlineComment: true,
  });
  const initParams = [{ lit: 'START' }, { lit: 'DURATION' }, { lit: 'CLIFF_DURATION' }];
  c.addComponent(components.VestingComponent, initParams, true);
}

function addSchedule(c: ContractBuilder, opts: VestingOptions) {
  switch (opts.schedule) {
    case 'linear':
      c.addUseClause('openzeppelin::finance::vesting', 'LinearVestingSchedule');
      return;
    case 'custom': {
      const scheduleTrait: BaseImplementedTrait = {
        name: `VestingSchedule`,
        of: 'VestingComponent::VestingScheduleTrait<ContractState>',
        tags: [],
        priority: 0,
      };
      c.addImplementedTrait(scheduleTrait);
      c.addFunction(scheduleTrait, {
        name: 'calculate_vested_amount',
        returns: 'u256',
        args: [
          {
            name: 'self',
            type: `@VestingComponent::ComponentState<ContractState>`,
          },
          { name: 'token', type: 'ContractAddress' },
          { name: 'total_allocation', type: 'u256' },
          { name: 'timestamp', type: 'u64' },
          { name: 'start', type: 'u64' },
          { name: 'duration', type: 'u64' },
          { name: 'cliff', type: 'u64' },
        ],
        code: ['// TODO: Must be implemented according to the desired vesting schedule', '0'],
      });
      return;
    }
  }
}

function getVestingStart(opts: VestingOptions): { timestampInSec: bigint; formattedDate: string } | undefined {
  if (opts.startDate === '' || opts.startDate === 'NaN') {
    return undefined;
  }
  const startDate = new Date(`${opts.startDate}Z`);
  const timestampInMillis = startDate.getTime();
  const timestampInSec = toUint(Math.floor(timestampInMillis / 1000), 'startDate', 'u64');
  const formattedDate = startDate.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'UTC',
  });
  return { timestampInSec, formattedDate: `${formattedDate} (UTC)` };
}

function getVestingDuration(opts: VestingOptions): number {
  try {
    return durationToTimestamp(opts.duration);
  } catch (e) {
    if (e instanceof Error) {
      throw new OptionsError({
        duration: e.message,
      });
    } else {
      throw e;
    }
  }
}

function getCliffDuration(opts: VestingOptions): number {
  try {
    return durationToTimestamp(opts.cliffDuration);
  } catch (e) {
    if (e instanceof Error) {
      throw new OptionsError({
        cliffDuration: e.message,
      });
    } else {
      throw e;
    }
  }
}

function validateDurations(duration: number, cliffDuration: number): void {
  validateUint(duration, 'duration', 'u64');
  validateUint(cliffDuration, 'cliffDuration', 'u64');
  if (cliffDuration > duration) {
    throw new OptionsError({
      cliffDuration: `Cliff duration must be less than or equal to the total duration`,
    });
  }
}

const components = defineComponents({
  VestingComponent: {
    path: 'openzeppelin::finance::vesting',
    substorage: {
      name: 'vesting',
      type: 'VestingComponent::Storage',
    },
    event: {
      name: 'VestingEvent',
      type: 'VestingComponent::Event',
    },
    impls: [
      {
        name: 'VestingImpl',
        value: 'VestingComponent::VestingImpl<ContractState>',
      },
      {
        name: 'VestingInternalImpl',
        embed: false,
        value: 'VestingComponent::InternalImpl<ContractState>',
      },
    ],
  },
});
