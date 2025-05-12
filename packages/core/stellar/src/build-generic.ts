import type { FungibleOptions } from './fungible';
import { buildFungible } from './fungible';
import type { NonFungibleOptions } from './non-fungible';
import { buildNonFungible } from './non-fungible';

export interface KindedOptions {
  Fungible: { kind: 'Fungible' } & FungibleOptions;
  NonFungible: { kind: 'NonFungible' } & NonFungibleOptions;
}

export type GenericOptions = KindedOptions[keyof KindedOptions];

export function buildGeneric(opts: GenericOptions) {
  switch (opts.kind) {
    case 'Fungible':
      return buildFungible(opts);

    case 'NonFungible':
      return buildNonFungible(opts);

    default: {
      const _: never = opts;
      throw new Error('Unknown kind');
    }
  }
}
