import type { ERC721Options } from '../erc721';
import { accessOptions } from '../set-access-control';
import { defaults as infoDefaults } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import type { RoyaltyInfoSubset } from '../set-royalty-info';
import { resolveRoyaltyOptionsSubset } from '../set-royalty-info';
import { generateAlternatives } from './alternatives';
import type { MacrosSubset } from '../set-macros';
import { resolveMacrosOptions } from '../set-macros';

const booleans = [true, false];

type GeneratorOptions = {
  royaltyInfo: RoyaltyInfoSubset;
  macros: MacrosSubset;
};

function prepareBlueprint(opts: GeneratorOptions) {
  return {
    name: ['MyToken'],
    symbol: ['MTK'],
    baseUri: ['https://example.com/'],
    burnable: booleans,
    enumerable: booleans,
    votes: booleans,
    appName: ['MyApp'],
    appVersion: ['v1'],
    pausable: booleans,
    mintable: booleans,
    royaltyInfo: resolveRoyaltyOptionsSubset(opts.royaltyInfo),
    access: accessOptions,
    upgradeable: upgradeableOptions,
    info: [infoDefaults],
    macros: resolveMacrosOptions(opts.macros),
  };
}

export function* generateERC721Options(opts: GeneratorOptions): Generator<Required<ERC721Options>> {
  const blueprint = prepareBlueprint(opts);
  yield* generateAlternatives(blueprint);
}
