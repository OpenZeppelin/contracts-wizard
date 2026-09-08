import { contractExactRequiredKeys, type AiFunctionDefinition } from '../types/function-definition.ts';
import { addFunctionPropertiesFrom } from './shared.ts';
import { midenCommonFunctionDescription } from './miden-shared.ts';
import {
  midenPrompts,
  midenFungibleDescriptions,
  midenNonFungibleDescriptions,
} from '../../../../common/src/ai/descriptions/miden.ts';

export const midenFungibleAIFunctionDefinition = {
  name: 'Fungible',
  description: midenPrompts.Fungible,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(midenCommonFunctionDescription, ['name', 'symbol', 'access', 'info']),
      // The Miden-specific descriptions must take precedence over the generic ones of `addFunctionPropertiesFrom`.
      burnable: midenCommonFunctionDescription.burnable,
      pausable: midenCommonFunctionDescription.pausable,
      restrictions: midenCommonFunctionDescription.restrictions,
      switchablePolicies: midenCommonFunctionDescription.switchablePolicies,
      description: midenCommonFunctionDescription.description,
      logoUri: midenCommonFunctionDescription.logoUri,
      updatableMetadata: midenCommonFunctionDescription.updatableMetadata,
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
      burnable: midenCommonFunctionDescription.burnable,
      pausable: midenCommonFunctionDescription.pausable,
      restrictions: midenCommonFunctionDescription.restrictions,
      switchablePolicies: midenCommonFunctionDescription.switchablePolicies,
      description: midenCommonFunctionDescription.description,
      logoUri: midenCommonFunctionDescription.logoUri,
      updatableMetadata: midenCommonFunctionDescription.updatableMetadata,
      contractUri: {
        type: 'string',
        description: midenNonFungibleDescriptions.contractUri,
      },
    },
    required: contractExactRequiredKeys<'miden', 'NonFungible'>()(['name', 'symbol']),
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'miden', 'NonFungible'>;
