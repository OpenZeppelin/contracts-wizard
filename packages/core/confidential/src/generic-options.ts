import type { ConfidentialFungibleOptions } from './confidentialFungible';

export interface KindedOptions {
    ConfidentialFungible: { kind: 'ConfidentialFungible' } & ConfidentialFungibleOptions;
}

export type GenericOptions = KindedOptions[keyof KindedOptions];