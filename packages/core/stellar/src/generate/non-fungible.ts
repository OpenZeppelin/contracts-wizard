import type { NonFungibleOptions } from '../non-fungible';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  baseUri: ['https://example.com/'],
  burnable: booleans,
  pausable: booleans,
  upgradeable: booleans,
  enumerable: booleans,
  consecutive: booleans,
  sequential: booleans,
  mintable: booleans,
  access: accessOptions,
  info: infoOptions,
};

export function* generateNonFungibleOptions(): Generator<Required<NonFungibleOptions>> {
  yield* generateAlternatives(blueprint);
}
