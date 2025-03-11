import type { Contract } from './contract';
import { ContractBuilder } from './contract';
import { setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import type { CommonContractOptions } from './common-options';
import { withCommonContractDefaults } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';

export const defaults: Required<CustomOptions> = {
  name: 'MyContract',
  pausable: false,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info,
} as const;

export function printCustom(opts: CustomOptions = defaults): string {
  return printContract(buildCustom(opts));
}

export interface CustomOptions extends CommonContractOptions {
  name: string;
  pausable?: boolean;
}

function withDefaults(opts: CustomOptions): Required<CustomOptions> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    pausable: opts.pausable ?? defaults.pausable,
  };
}

export function isAccessControlRequired(opts: Partial<CustomOptions>): boolean {
  return opts.pausable === true || opts.upgradeable === true;
}

export function buildCustom(opts: CustomOptions): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  if (allOpts.pausable) {
    addPausable(c, allOpts.access);
  }

  setAccessControl(c, allOpts.access);
  setUpgradeable(c, allOpts.upgradeable, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}
