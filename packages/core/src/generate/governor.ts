import { defaults, GovernorOptions, timelockOptions, votesOptions } from '../governor';
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
  upgradeable: upgradeableOptions,
  access: accessOptions,
  info: infoOptions,
};

export function* generateGovernorOptions(): Generator<Required<GovernorOptions>> {
  yield* generateAlternatives(blueprint);
}
