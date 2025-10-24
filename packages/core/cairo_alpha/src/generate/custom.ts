import type { CustomOptions } from '../custom';
import type { AccessSubset } from '../set-access-control';
import { resolveAccessControlOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

type GeneratorOptions = {
  access: AccessSubset;
};

function prepareBlueprint(opts: GeneratorOptions) {
  return {
    name: ['MyContract'],
    pausable: booleans,
    access: resolveAccessControlOptions(opts.access),
    upgradeable: upgradeableOptions,
    info: infoOptions,
  };
}

export function* generateCustomOptions(opts: GeneratorOptions): Generator<Required<CustomOptions>> {
  const blueprint = prepareBlueprint(opts);
  yield* generateAlternatives(blueprint);
}
