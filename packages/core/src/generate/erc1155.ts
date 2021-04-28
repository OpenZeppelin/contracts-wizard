import type { ERC1155Options } from '../erc1155';
import { accessOptions } from '../set-access-control';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  uri: ['https://example.com/'],
  burnable: booleans,
  pausable: booleans,
  mintable: booleans,
  access: accessOptions,
};

export function* generateERC1155Options(): Generator<Required<ERC1155Options>> {
  yield* generateAlternatives(blueprint);
}
