import { infoOptions } from '../set-info';
import type { MultisigOptions } from '../multisig';
import { generateAlternatives } from './alternatives';
import type { MacrosSubset } from '../set-macros';
import { resolveMacrosOptions } from '../set-macros';

type GeneratorOptions = {
  macros: MacrosSubset;
};

function prepareBlueprint(opts: GeneratorOptions) {
  return {
    name: ['MyMultisig'],
    quorum: ['1', '2', '42'],
    upgradeable: [true, false],
    info: infoOptions,
    macros: resolveMacrosOptions(opts.macros),
  };
};

export function* generateMultisigOptions(opts: GeneratorOptions): Generator<Required<MultisigOptions>> {
  const blueprint = prepareBlueprint(opts);
  yield* generateAlternatives(blueprint);
}
