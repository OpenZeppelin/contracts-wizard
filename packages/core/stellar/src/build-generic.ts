import type { FungibleOptions } from './fungible';
import { buildFungible } from './fungible';
import type { GovernorOptions } from './governor';
import { buildGovernor } from './governor';
import type { NonFungibleOptions } from './non-fungible';
import { buildNonFungible } from './non-fungible';
import type { StablecoinOptions } from './stablecoin';
import { buildStablecoin } from './stablecoin';
import type { VaultOptions } from './vault';
import { buildVault } from './vault';

export interface KindedOptions {
  Fungible: { kind: 'Fungible' } & FungibleOptions;
  Governor: { kind: 'Governor' } & GovernorOptions;
  NonFungible: { kind: 'NonFungible' } & NonFungibleOptions;
  Stablecoin: { kind: 'Stablecoin' } & StablecoinOptions;
  Vault: { kind: 'Vault' } & VaultOptions;
}

export type GenericOptions = KindedOptions[keyof KindedOptions];

export function buildGeneric(opts: GenericOptions) {
  switch (opts.kind) {
    case 'Fungible':
      return buildFungible(opts);

    case 'Governor':
      return buildGovernor(opts);

    case 'NonFungible':
      return buildNonFungible(opts);

    case 'Stablecoin':
      return buildStablecoin(opts);

    case 'Vault':
      return buildVault(opts);

    default: {
      const _: never = opts;
      throw new Error('Unknown kind');
    }
  }
}
