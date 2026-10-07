import { contractExactRequiredKeys, type AiFunctionDefinition } from '../types/function-definition.ts';
import { addFunctionPropertiesFrom } from './shared.ts';
import { midenCommonFunctionDescription } from './miden-shared.ts';
import {
  midenPrompts,
  midenFungibleDescriptions,
  midenNonFungibleDescriptions,
} from '../../../../common/src/ai/descriptions/miden.ts';
import { extractStringEnumValues } from '../types/helpers.ts';
import type { FungibleBurnPolicy, NonFungibleBurnPolicy } from '../../../../core/miden/dist';

export const midenFungibleAIFunctionDefinition = {
  name: 'Fungible',
  description: midenPrompts.Fungible,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(midenCommonFunctionDescription, ['name', 'symbol', 'access', 'info']),
      // The Miden-specific descriptions must take precedence over the generic ones of `addFunctionPropertiesFrom`.
      pausable: {
        type: 'boolean',
        description: midenFungibleDescriptions.pausable,
      },
      pausableTransfers: {
        type: 'boolean',
        description: midenFungibleDescriptions.pausableTransfers,
      },
      transferPolicy: midenCommonFunctionDescription.transferPolicy,
      switchableTransferPolicy: midenCommonFunctionDescription.switchableTransferPolicy,
      description: midenCommonFunctionDescription.description,
      logoUri: midenCommonFunctionDescription.logoUri,
      updatableMetadata: {
        type: 'boolean',
        description: midenFungibleDescriptions.updatableMetadata,
      },
      burnPolicy: {
        type: 'string',
        enum: extractStringEnumValues<FungibleBurnPolicy>()(['anyHolder', 'minimumAmount', 'ownerOnly']),
        description: midenFungibleDescriptions.burnPolicy,
      },
      decimals: {
        type: 'string',
        description: midenFungibleDescriptions.decimals,
      },
      maxSupply: {
        type: 'string',
        description: midenFungibleDescriptions.maxSupply,
      },
      externalLink: {
        type: 'string',
        description: midenFungibleDescriptions.externalLink,
      },
      updatableMaxSupply: {
        type: 'boolean',
        description: midenFungibleDescriptions.updatableMaxSupply,
      },
      minBurnAmount: {
        type: 'string',
        description: midenFungibleDescriptions.minBurnAmount,
      },
    },
    required: contractExactRequiredKeys<'miden', 'Fungible'>()(['name', 'symbol']),
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'miden', 'Fungible'>;

export const midenNonFungibleAIFunctionDefinition = {
  name: 'NonFungible',
  description: midenPrompts.NonFungible,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(midenCommonFunctionDescription, ['name', 'symbol', 'access', 'info']),
      pausable: {
        type: 'boolean',
        description: midenNonFungibleDescriptions.pausable,
      },
      pausableTransfers: {
        type: 'boolean',
        description: midenNonFungibleDescriptions.pausableTransfers,
      },
      transferPolicy: midenCommonFunctionDescription.transferPolicy,
      switchableTransferPolicy: midenCommonFunctionDescription.switchableTransferPolicy,
      description: midenCommonFunctionDescription.description,
      logoUri: midenCommonFunctionDescription.logoUri,
      updatableMetadata: {
        type: 'boolean',
        description: midenNonFungibleDescriptions.updatableMetadata,
      },
      burnPolicy: {
        type: 'string',
        enum: extractStringEnumValues<NonFungibleBurnPolicy>()(['anyHolder', 'ownerOnly']),
        description: midenNonFungibleDescriptions.burnPolicy,
      },
      contractUri: {
        type: 'string',
        description: midenNonFungibleDescriptions.contractUri,
      },
    },
    required: contractExactRequiredKeys<'miden', 'NonFungible'>()(['name', 'symbol']),
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'miden', 'NonFungible'>;
