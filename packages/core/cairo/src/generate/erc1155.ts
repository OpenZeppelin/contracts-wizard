import type { ERC1155Options } from '../erc1155';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import type { RoyaltyInfoSubset } from '../set-royalty-info';
import { resolveRoyaltyOptionsSubset } from '../set-royalty-info';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

type GeneratorOptions = {
  royaltyInfo: RoyaltyInfoSubset;
};

function prepareBlueprint(opts: GeneratorOptions) {
  const royaltyInfo = resolveRoyaltyOptionsSubset(opts.royaltyInfo);
  return {
    name: ['MyToken'],
    baseUri: ['https://example.com/'],
    burnable: booleans,
    pausable: booleans,
    mintable: booleans,
    updatableUri: booleans,
    upgradeable: upgradeableOptions,
    royaltyInfo,
    access: accessOptions,
    info: infoOptions,
  };
}

export function* generateERC1155Options(opts: GeneratorOptions): Generator<Required<ERC1155Options>> {
  const blueprint = prepareBlueprint(opts);
  yield* generateAlternatives(blueprint);
}
