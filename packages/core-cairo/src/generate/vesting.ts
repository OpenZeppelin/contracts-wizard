import { infoOptions } from '../set-info';
import type { VestingOptions } from '../vesting';
import { generateAlternatives } from './alternatives';

const blueprint = {
  name: ['MyVesting'],
  startDate: [new Date().toDateString()],
  duration: ['90 days', '1 year'],
  cliffDuration: ['0', '30 day'],
  schedule: ['linear', 'custom'] as const,
  info: infoOptions
};

export function* generateVestingOptions(): Generator<Required<VestingOptions>> {
  yield* generateAlternatives(blueprint);
}
