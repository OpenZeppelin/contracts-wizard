import type { ERC1155Options } from '../erc1155';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  burnable: booleans,
  mintable: booleans,
  supply: booleans,
  pausable: [false], // TODO: update to `booleans` on https://github.com/OpenZeppelin/rust-contracts-stylus/issues/539
  access: accessOptions,
  info: infoOptions,
};

export function* generateERC1155Options(): Generator<Required<ERC1155Options>> {
  yield* generateAlternatives(blueprint);
}
