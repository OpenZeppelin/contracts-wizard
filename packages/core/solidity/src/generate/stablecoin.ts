import { crossChainBridgingOptions } from '../erc20';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import type { StablecoinOptions } from '../stablecoin';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const erc20Basic = {
  name: ['MyStablecoin'],
  symbol: ['MST'],
  burnable: [false] as const,
  pausable: [false] as const,
  mintable: [false] as const,
  callback: [false] as const,
  permit: [false] as const,
  votes: [false] as const,
  flashmint: [false] as const,
  premint: ['1'],
  premintChainId: [''],
  crossChainBridging: [false] as const,
  access: [false] as const,
  info: [{}] as const,
  namespacePrefix: ['myProject'],
};

const erc20Full = {
  name: ['MyStablecoin'],
  symbol: ['MST'],
  burnable: [true] as const,
  pausable: [true] as const,
  mintable: [true] as const,
  callback: [true] as const,
  permit: [true] as const,
  votes: ['timestamp'] as const,
  flashmint: [true] as const,
  premint: ['1'],
  premintChainId: ['10'],
  crossChainBridging: crossChainBridgingOptions,
  access: accessOptions,
  info: infoOptions,
  namespacePrefix: ['myProject'],
};

const stablecoinExtensions = {
  limitations: [false, 'allowlist', 'blocklist'] as const,
  custodian: booleans,
  upgradeable: [false] as const,
};

export function* generateStablecoinOptions(): Generator<Required<StablecoinOptions>> {
  yield* generateAlternatives({ ...erc20Basic, ...stablecoinExtensions });
  yield* generateAlternatives({ ...erc20Full, ...stablecoinExtensions });
}
