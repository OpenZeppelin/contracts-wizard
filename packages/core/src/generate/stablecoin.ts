import type { StablecoinOptions } from '../stablecoin';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyStablecoin'],
  pausable: booleans,
  access: accessOptions,
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

export function* generateStablecoinOptions(): Generator<Required<StablecoinOptions>> {
  yield* generateAlternatives(blueprint);
}
