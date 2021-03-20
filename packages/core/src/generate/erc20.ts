import type { ERC20Options } from '../erc20';
import { accessOptions } from '../set-access-control';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  burnable: booleans,
  snapshots: booleans,
  pausable: booleans,
  mintable: booleans,
  premint: [1],
  access: accessOptions,
};

export function* generateERC20Options(): Generator<Required<ERC20Options>> {
  yield* generateAlternatives(blueprint);
}
