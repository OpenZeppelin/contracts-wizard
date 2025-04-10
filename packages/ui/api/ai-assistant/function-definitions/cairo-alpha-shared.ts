import type { AiFunctionPropertyDefinition } from '../types/function-definition.ts';
import type { CairoAlphaCommonContractOptions, CairoAlphaRoyaltyInfoOptions } from '../types/languages.ts';

const commonContractFunctionDescription = {
  upgradeable: {
    type: 'boolean',
    description: 'Whether the smart contract is upgradeable.',
  },

  info: {
    type: 'object',
    description: 'Metadata about the contract and author',
    properties: {
      license: {
        type: 'string',
        description: 'The license used by the contract, default is "MIT"',
      },
    },
  },

  access: {
    anyOf: [
      { type: 'boolean', enum: [false] },
      { type: 'string', enum: ['ownable', 'roles'] },
    ],
    description:
      'The type of access control to provision. Ownable is a simple mechanism with a single account authorized for all privileged actions. Roles is a flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.',
  },
} as const satisfies AiFunctionPropertyDefinition<CairoAlphaCommonContractOptions>['properties'];

export const cairoAlphaSharedFunctionDefinition = {
  ...commonContractFunctionDescription,

  appName: {
    type: 'string',
    description:
      'Required when votes is enabled, for hashing and signing typed structured data. Name for domain separator implementing SNIP12Metadata trait. Prevents two applications from producing the same hash.',
  },

  appVersion: {
    type: 'string',
    description:
      'Required when votes is enabled, for hashing and signing typed structured data. Version for domain separator implementing SNIP12Metadata trait. Prevents two versions of the same application from producing the same hash.',
  },

  royaltyInfo: {
    type: 'object',
    description:
      'Provides information for how much royalty is owed and to whom, based on a sale price. Follows ERC-2981 standard.',
    properties: {
      enabled: {
        type: 'boolean',
        description: 'Whether to enable royalty feature for the contract',
      },
      defaultRoyaltyFraction: {
        type: 'string',
        description:
          "The royalty fraction that will be default for all tokens. It will be used for a token if there's no custom royalty fraction set for it.",
      },
      feeDenominator: {
        type: 'string',
        description: "The denominator used to interpret a token's fee and to calculate the result fee fraction.",
      },
    },
  },
} as const satisfies AiFunctionPropertyDefinition<
  { royaltyInfo: CairoAlphaRoyaltyInfoOptions } & { appName: string; appVersion: string }
>['properties'];
