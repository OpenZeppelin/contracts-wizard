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
  proposalThreshold: ['1000e18'],
  quorum: [
    { mode: 'percent', percent: 30 },
    { mode: 'absolute', votes: '1000e18' },
  ] as const,
  supplyForQuorum: ['auto' as const, 1000e18],
  votes: votesOptions,
  timelock: timelockOptions,
  bravo: booleans,
  upgradeable: upgradeableOptions,
};

export function* generateGovernorOptions(forceTrue: boolean): Generator<Required<GovernorOptions>> {
  yield* generateAlternatives(blueprint, forceTrue);
}
