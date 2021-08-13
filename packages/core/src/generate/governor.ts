import { defaults, GovernorOptions, timelockOptions, votesOptions } from '../governor';
import { accessOptions } from '../set-access-control';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyGovernor'],
  delay: ['1 week'],
  period: ['1 week'],
  blockTime: [defaults.blockTime],
  proposalThreshold: ['0', '1000e18'],
  decimals: [18],
  quorum: [
    { mode: 'percent', percent: 30 },
    { mode: 'absolute', votes: '1000e18' },
  ] as const,
  votes: votesOptions,
  timelock: timelockOptions,
  bravo: booleans,
  upgradeable: upgradeableOptions,
  access: accessOptions,
};

export function* generateGovernorOptions(): Generator<Required<GovernorOptions>> {
  // forceTrue is not relevant here. The only boolean is bravo and we need to build both on and off.
  yield* generateAlternatives(blueprint);
}
