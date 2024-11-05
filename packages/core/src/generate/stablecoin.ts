import type { StablecoinOptions } from '../stablecoin';
import { accessOptions } from '../set-access-control';
import { clockModeOptions } from '../set-clock-mode';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyStablecoin'],
  symbol: ['MST'],
  burnable: booleans,
  pausable: booleans,
  mintable: booleans,
  permit: booleans,
  limitations: booleans,
  votes: [ ...booleans, ...clockModeOptions ] as const,
  flashmint: booleans,
  premint: ['1'],
  custodian: booleans,
  access: accessOptions,
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

export function* generateStablecoinOptions(): Generator<Required<StablecoinOptions>> {
  for (const opts of generateAlternatives(blueprint)) {
    yield { ...opts, upgradeable: false };
  }
}
