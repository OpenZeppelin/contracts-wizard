import type { ERC20Options } from '../erc20';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';
import type { MacrosSubset } from '../set-macros';
import { resolveMacrosOptions } from '../set-macros';

const booleans = [true, false];

type GeneratorOptions = {
  macros: MacrosSubset;
};

function prepareBlueprint(opts: GeneratorOptions) {
  return {
    name: ['MyToken'],
    symbol: ['MTK'],
    decimals: ['6', '18'],
    burnable: booleans,
    pausable: booleans,
    mintable: booleans,
    premint: ['1'],
    votes: booleans,
    appName: ['MyApp'],
    appVersion: ['v1'],
    access: accessOptions,
    upgradeable: upgradeableOptions,
    info: infoOptions,
    macros: resolveMacrosOptions(opts.macros),
  };
}

export function* generateERC20Options(opts: GeneratorOptions): Generator<Required<ERC20Options>> {
  const blueprint = prepareBlueprint(opts);
  yield* generateAlternatives(blueprint);
}
