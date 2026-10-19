import { crossChainBridgingOptions } from '../erc20';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import type { StablecoinOptions } from '../stablecoin';
import { aceBlueprint } from './erc20';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const erc20Basic = {
  name: ['MyStablecoin'],
  symbol: ['MST'],
  chainlinkAce: [false] as const,
  decimals: ['6'],
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
  crossChainLinkAllowOverride: [false] as const,
  access: [false] as const,
  info: [{}] as const,
  namespacePrefix: ['myProject'],
};

const erc20Full = {
  name: ['MyStablecoin'],
  symbol: ['MST'],
  chainlinkAce: [false] as const,
  decimals: ['18'],
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
  crossChainLinkAllowOverride: [true] as const,
  access: accessOptions,
  info: infoOptions,
  namespacePrefix: ['myProject'],
};

const stablecoinExtensions = {
  restrictions: [false, 'allowlist', 'blocklist'] as const,
  freezable: booleans,
  upgradeable: [false] as const,
};

export function* generateStablecoinOptions(): Generator<Required<StablecoinOptions>> {
  for (const opts of generateAlternatives({ ...aceBlueprint, ...stablecoinExtensions })) {
    if (opts.crossChainBridging === 'chainlink-ccip' && (opts.access !== 'roles' || !opts.mintable)) continue;
    yield opts;
  }
  yield* generateAlternatives({ ...erc20Basic, ...stablecoinExtensions });
  for (const opts of generateAlternatives({ ...erc20Full, ...stablecoinExtensions })) {
    if (opts.crossChainBridging === 'chainlink-ccip' && (opts.access !== 'roles' || !opts.mintable)) continue;
    yield opts;
  }
}
