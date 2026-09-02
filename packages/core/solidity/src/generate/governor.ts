import type { GovernorOptions } from '../governor';
import { defaults, timelockOptions, votesOptions } from '../governor';
import { accessOptions } from '../set-access-control';
import { clockModeOptions } from '../set-clock-mode';
import { infoOptions } from '../set-info';
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
  clockMode: clockModeOptions,
  timelock: timelockOptions,
  storage: booleans,
  settings: booleans,
  crossChainExecution: [false],
  upgradeable: upgradeableOptions,
  access: accessOptions,
  info: infoOptions,
};

// crossChainExecution adds a single extension with no interactions with other options,
// so cross it against a reduced blueprint to avoid doubling the exhaustive matrix.
const crossChainExecutionBlueprint = {
  ...blueprint,
  proposalThreshold: ['0'],
  quorumMode: ['percent'] as const,
  storage: [false],
  settings: [true],
  crossChainExecution: [true],
  access: [false] as const,
  info: [{}],
};

export function* generateGovernorOptions(): Generator<Required<GovernorOptions>> {
  yield* generateAlternatives(blueprint);
  yield* generateAlternatives(crossChainExecutionBlueprint);
}
