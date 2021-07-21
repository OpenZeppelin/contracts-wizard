import type { ERC721Options } from '../erc721';
import { accessOptions } from '../set-access-control';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  baseUri: ['https://example.com/'],
  enumerable: booleans,
  uriStorage: booleans,
  burnable: booleans,
  pausable: booleans,
  mintable: booleans,
  incremental: booleans,
  access: accessOptions,
  upgradeable: upgradeableOptions,
};

export function* generateERC721Options(forceTrue: boolean): Generator<Required<ERC721Options>> {
  yield* generateAlternatives(blueprint, forceTrue);
}
