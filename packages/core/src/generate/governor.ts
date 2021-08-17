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
  proposalThreshold: ['0', '1000'],
  decimals: [18],
  quorumMode: ['percent', 'absolute'] as const,
  quorumPercent: [4],
  quorumAbsolute: ['1000'],
  votes: votesOptions,
  timelock: timelockOptions,
  bravo: booleans,
  upgradeable: upgradeableOptions,
  access: accessOptions,
};

export function* generateGovernorOptions(): Generator<Required<GovernorOptions>> {
  yield* generateAlternatives(blueprint);
}
