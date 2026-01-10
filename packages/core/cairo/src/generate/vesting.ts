import { infoOptions } from '../set-info';
import type { VestingOptions } from '../vesting';
import { generateAlternatives } from './alternatives';
import type { MacrosSubset } from '../set-macros';
import { resolveMacrosOptions } from '../set-macros';

type GeneratorOptions = {
  macros: MacrosSubset;
};

function prepareBlueprint(opts: GeneratorOptions) {
  return {
    name: ['MyVesting'],
    startDate: ['2024-12-31T23:59'],
    duration: ['90 days', '1 year'],
    cliffDuration: ['0 seconds', '30 day'],
    schedule: ['linear', 'custom'] as const,
    info: infoOptions,
    macros: resolveMacrosOptions(opts.macros),
  };
}

export function* generateVestingOptions(opts: GeneratorOptions): Generator<Required<VestingOptions>> {
  const blueprint = prepareBlueprint(opts);
  yield* generateAlternatives(blueprint);
}
