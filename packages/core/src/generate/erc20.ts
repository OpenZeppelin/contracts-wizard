import type { ERC20Options } from '../erc20';
import { accessOptions } from '../set-access-control';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  burnable: booleans,
  snapshots: booleans,
  pausable: booleans,
  mintable: booleans,
  permit: booleans,
  votes: booleans,
  flashmint: booleans,
  premint: ['1'],
  access: accessOptions,
  upgradeable: upgradeableOptions,
};

export function* generateERC20Options(): Generator<Required<ERC20Options>> {
  yield* generateAlternatives(blueprint);
}
