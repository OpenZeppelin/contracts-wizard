import type { GovernorOptions } from '../governor';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyGovernor'],
  version: ['1.0.0'],
  votingDelay: ['10'],
  votingPeriod: ['100'],
  proposalThreshold: ['100'],
  quorum: ['500'],
  upgradeable: booleans,
  timelock: booleans,
  access: accessOptions,
  info: infoOptions,
  explicitImplementations: booleans,
};

export function* generateGovernorOptions(): Generator<Required<GovernorOptions>> {
  yield* generateAlternatives(blueprint);
}
