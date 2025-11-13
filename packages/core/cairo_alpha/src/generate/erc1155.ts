import type { ERC1155Options } from '../erc1155';
import type { AccessSubset } from '../set-access-control';
import { resolveAccessControlOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import type { RoyaltyInfoSubset } from '../set-royalty-info';
import { resolveRoyaltyOptionsSubset } from '../set-royalty-info';
import type { MacrosSubset } from '../set-macros';
import { resolveMacrosOptions } from '../set-macros';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

type GeneratorOptions = {
  access: AccessSubset;
  royaltyInfo: RoyaltyInfoSubset;
  macros: MacrosSubset;
};

function prepareBlueprint(opts: GeneratorOptions) {
  return {
    name: ['MyToken'],
    baseUri: ['https://www.mytoken.com/'],
    burnable: booleans,
    pausable: booleans,
    mintable: booleans,
    updatableUri: booleans,
    upgradeable: upgradeableOptions,
    royaltyInfo: resolveRoyaltyOptionsSubset(opts.royaltyInfo),
    access: resolveAccessControlOptions(opts.access),
    info: infoOptions,
    macros: resolveMacrosOptions(opts.macros),
  };
}

export function* generateERC1155Options(opts: GeneratorOptions): Generator<Required<ERC1155Options>> {
  const blueprint = prepareBlueprint(opts);
  yield* generateAlternatives(blueprint);
}
