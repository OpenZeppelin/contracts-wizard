import type { GovernorOptions } from '../governor';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const blueprint = {
  name: ['MyGovernor'],
  version: ['1.0.0'],
  votingDelay: ['10'],
  votingPeriod: ['100'],
  proposalThreshold: ['100'],
  quorum: ['500'],
  info: infoOptions,
};

export function* generateGovernorOptions(): Generator<Required<GovernorOptions>> {
  yield* generateAlternatives(blueprint);
}
