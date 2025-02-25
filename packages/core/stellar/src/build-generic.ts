import type { FungibleOptions } from './fungible';
import { buildFungible } from './fungible';

export interface KindedOptions {
  Fungible: { kind: 'Fungible' } & FungibleOptions;
}

export type GenericOptions = KindedOptions[keyof KindedOptions];

export function buildGeneric(opts: GenericOptions) {
  switch (opts.kind) {
    case 'Fungible':
      return buildFungible(opts);

    default:
      // eslint-disable-next-line no-case-declarations
      const _: never = opts.kind; // TODO: When there are additional kinds above, change this assignment to just `opts` instead of `opts.kind`
      throw new Error('Unknown ERC');
  }
}
