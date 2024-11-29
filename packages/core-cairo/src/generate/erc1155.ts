import type { ERC1155Options } from '../erc1155';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { testRoyaltyInfoOptions } from '../set-royalty-info';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  baseUri: ['https://example.com/'],
  burnable: booleans,
  pausable: booleans,
  mintable: booleans,
  updatableUri: booleans,
  upgradeable: upgradeableOptions,
  royaltyInfo: testRoyaltyInfoOptions,
  access: accessOptions,
  info: infoOptions,
};

export function* generateERC1155Options(): Generator<Required<ERC1155Options>> {
  yield* generateAlternatives(blueprint);
}
