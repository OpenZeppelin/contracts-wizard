import type { ERC20Options } from '../erc20';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  burnable: booleans,
  pausable: booleans,
  access: accessOptions,
  info: infoOptions
};

export function* generateERC20Options(): Generator<Required<ERC20Options>> {
  yield* generateAlternatives(blueprint);
}
