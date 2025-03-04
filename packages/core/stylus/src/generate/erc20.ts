import type { ERC20Options } from '../erc20';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  burnable: booleans,
  // pausable: booleans, // TODO: uncomment on https://github.com/OpenZeppelin/rust-contracts-stylus/issues/539
  permit: booleans,
  flashmint: booleans,
  access: accessOptions,
  info: infoOptions,
};

export function* generateERC20Options(): Generator<Required<ERC20Options>> {
  yield* generateAlternatives(blueprint);
}
