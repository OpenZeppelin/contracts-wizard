import type { FungibleOptions } from '../fungible';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  burnable: booleans,
  pausable: booleans,
  mintable: booleans,
  premint: ['1'],
  votes: booleans,
  appName: ['MyApp'],
  appVersion: ['v1'],
  access: accessOptions,
  upgradeable: upgradeableOptions,
  info: infoOptions
};

export function* generateFungibleOptions(): Generator<Required<FungibleOptions>> {
  yield* generateAlternatives(blueprint);
}
