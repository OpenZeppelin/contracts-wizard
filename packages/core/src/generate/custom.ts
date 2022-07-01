import type { CustomOptions } from '../custom';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyContract'],
  pausable: booleans,
  access: accessOptions,
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

export function* generateCustomOptions(): Generator<Required<CustomOptions>> {
  yield* generateAlternatives(blueprint);
}
