import { limitationsOptions, type StablecoinOptions } from '../stablecoin';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyStablecoin'],
  symbol: ['MST'],
  burnable: booleans,
  pausable: booleans,
  upgradeable: booleans,
  mintable: booleans,
  premint: ['1'],
  access: accessOptions,
  limitations: limitationsOptions,
  info: infoOptions,
  explicitImplementations: booleans,
};

export function* generateStablecoinOptions(): Generator<Required<StablecoinOptions>> {
  yield* generateAlternatives(blueprint);
}
