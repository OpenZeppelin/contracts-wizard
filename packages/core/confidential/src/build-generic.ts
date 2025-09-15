import type { ConfidentialFungibleOptions } from './confidentialFungible';
import { buildConfidentialFungible } from './confidentialFungible';
import type { Contract } from '@openzeppelin/wizard';

export interface KindedOptions {
  ConfidentialFungible: { kind: 'ConfidentialFungible' } & ConfidentialFungibleOptions;
}

export type GenericOptions = KindedOptions[keyof KindedOptions];

export function buildGeneric(opts: GenericOptions): Contract {
  switch (opts.kind) {
    case 'ConfidentialFungible':
      return buildConfidentialFungible(opts);

    default: {
      // TODO: When other contract kinds are available, change the below to:
      // const _: never = opts;
      const _: never = opts.kind;
      throw new Error('Unknown contract kind');
    }
  }
}
