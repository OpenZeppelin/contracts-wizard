import type { ERC721Options } from '../erc721';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  burnable: booleans,
  enumerable: booleans,
  // pausable: booleans, // TODO: uncomment on https://github.com/OpenZeppelin/rust-contracts-stylus/issues/539
  mintable: booleans,
  access: accessOptions,
  info: infoOptions,
};

export function* generateERC721Options(): Generator<Required<ERC721Options>> {
  yield* generateAlternatives(blueprint);
}
