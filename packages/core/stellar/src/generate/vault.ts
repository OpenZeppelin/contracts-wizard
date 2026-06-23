import type { VaultOptions } from '../vault';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyVault'],
  symbol: ['MTK'],
  pausable: booleans,
  upgradeable: booleans,
  access: accessOptions,
  info: infoOptions,
  explicitImplementations: booleans,
};

export function* generateVaultOptions(): Generator<Required<VaultOptions>> {
  yield* generateAlternatives(blueprint);
}
