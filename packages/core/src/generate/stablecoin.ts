import type { StablecoinOptions } from '../stablecoin';
import { generateAlternatives } from './alternatives';
import { blueprint as erc20Blueprint } from './erc20';

const booleans = [true, false];

const blueprint = {
  ...erc20Blueprint,
  name: ['MyStablecoin'],
  symbol: ['MST'],
  limitations: [false, 'allowlist', 'blocklist'] as const,
  custodian: booleans,
  upgradeable: [false] as const,
};

export function* generateStablecoinOptions(): Generator<Required<StablecoinOptions>> {
  yield* generateAlternatives(blueprint);
}
