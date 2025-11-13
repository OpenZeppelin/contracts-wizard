import type { ERC721Options } from '../erc721';
import type { AccessSubset } from '../set-access-control';
import { resolveAccessControlOptions } from '../set-access-control';
import { defaults as infoDefaults } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import type { RoyaltyInfoSubset } from '../set-royalty-info';
import { resolveRoyaltyOptionsSubset } from '../set-royalty-info';
import { generateAlternatives } from './alternatives';
import type { MacrosSubset } from '../set-macros';
import { resolveMacrosOptions } from '../set-macros';

const booleans = [true, false];

type GeneratorOptions = {
  access: AccessSubset;
  royaltyInfo: RoyaltyInfoSubset;
  macros: MacrosSubset;
};

function prepareBlueprint(opts: GeneratorOptions) {
  return {
    name: ['MyToken'],
    symbol: ['MTK'],
    baseUri: ['https://www.mytoken.com/'],
    burnable: booleans,
    enumerable: booleans,
    votes: booleans,
    appName: ['MyApp'],
    appVersion: ['v1'],
    pausable: booleans,
    mintable: booleans,
    royaltyInfo: resolveRoyaltyOptionsSubset(opts.royaltyInfo),
    access: resolveAccessControlOptions(opts.access),
    upgradeable: upgradeableOptions,
    info: [infoDefaults],
    macros: resolveMacrosOptions(opts.macros),
  };
}

export function* generateERC721Options(opts: GeneratorOptions): Generator<Required<ERC721Options>> {
  const blueprint = prepareBlueprint(opts);
  yield* generateAlternatives(blueprint);
}
