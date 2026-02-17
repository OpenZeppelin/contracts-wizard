import type { CustomOptions } from '../custom';
import type { AccessSubset } from '../set-access-control';
import { resolveAccessControlOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import type { UpgradeableSubset } from '../set-upgradeable';
import { resolveUpgradeableOptionsSubset } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';
import type { MacrosSubset } from '../set-macros';
import { resolveMacrosOptions } from '../set-macros';

const booleans = [true, false];

type GeneratorOptions = {
  access: AccessSubset;
  upgradeable: UpgradeableSubset;
  macros: MacrosSubset;
};

function prepareBlueprint(opts: GeneratorOptions) {
  return {
    name: ['MyContract'],
    pausable: booleans,
    access: resolveAccessControlOptions(opts.access),
    upgradeable: resolveUpgradeableOptionsSubset(opts.upgradeable),
    info: infoOptions,
    macros: resolveMacrosOptions(opts.macros),
  };
}

export function* generateCustomOptions(opts: GeneratorOptions): Generator<Required<CustomOptions>> {
  const blueprint = prepareBlueprint(opts);
  yield* generateAlternatives(blueprint);
}
