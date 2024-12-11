import { clockModeOptions, GovernorOptions, quorumModeOptions, timelockOptions, votesOptions } from '../governor';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyGovernor'],
  delay: ['1'],
  period: ['1'],
  proposalThreshold: ['1'],
  decimals: [18],
  quorumMode: quorumModeOptions,
  quorumPercent: [10],
  quorumAbsolute: ['10'],
  votes: votesOptions,
  clockMode: clockModeOptions,
  timelock: timelockOptions,
  settings: booleans,
  appName: ['Openzeppelin Governor'],
  appVersion: ['v1'],
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

export function* generateGovernorOptions(): Generator<Required<GovernorOptions>> {
  yield* generateAlternatives(blueprint);
}

