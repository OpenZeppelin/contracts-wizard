import type { GovernorOptions } from '../governor';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const blueprint = {
  name: ['MyGovernor'],
  version: ['1.0.0'],
  votingDelay: ['1'],
  votingPeriod: ['17280'],
  proposalThreshold: ['1'],
  quorum: ['1'],
  info: infoOptions,
};

export function* generateGovernorOptions(): Generator<Required<GovernorOptions>> {
  yield* generateAlternatives(blueprint);
}
