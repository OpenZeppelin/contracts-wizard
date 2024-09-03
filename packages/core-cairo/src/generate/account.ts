import type { AccountOptions } from '../account';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyAccount'],
  symbol: ['MTK'],
  baseUri: ['https://example.com/'],
  burnable: booleans,
  pausable: booleans,
  mintable: booleans,
  access: accessOptions,
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

export function* generateAccountOptions(): Generator<Required<AccountOptions>> {
  yield* generateAlternatives(blueprint);
}
