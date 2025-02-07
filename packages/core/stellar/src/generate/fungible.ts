import type { FungibleOptions } from '../fungible';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  burnable: booleans,
  pausable: booleans,
  mintable: booleans,
  premint: ['1'],
  access: accessOptions,
  info: infoOptions
};

export function* generateFungibleOptions(): Generator<Required<FungibleOptions>> {
  yield* generateAlternatives(blueprint);
}
