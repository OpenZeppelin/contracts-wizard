import type { ERC6909Options } from '../erc6909';
import type { AccessSubset } from '../set-access-control';
import { resolveAccessControlOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import type { UpgradeableSubset } from '../set-upgradeable';
import { resolveUpgradeableOptionsSubset } from '../set-upgradeable';
import type { MacrosSubset } from '../set-macros';
import { resolveMacrosOptions } from '../set-macros';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

type GeneratorOptions = {
  access: AccessSubset;
  upgradeable: UpgradeableSubset;
  macros: MacrosSubset;
};

function prepareBlueprint(opts: GeneratorOptions) {
  return {
    name: ['MyToken'],
    burnable: booleans,
    pausable: booleans,
    mintable: booleans,
    upgradeable: resolveUpgradeableOptionsSubset(opts.upgradeable),
    access: resolveAccessControlOptions(opts.access),
    info: infoOptions,
    macros: resolveMacrosOptions(opts.macros),
  };
}

export function* generateERC6909Options(opts: GeneratorOptions): Generator<Required<ERC6909Options>> {
  const blueprint = prepareBlueprint(opts);
  yield* generateAlternatives(blueprint);
}
