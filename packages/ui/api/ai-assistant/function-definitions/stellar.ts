import type { AiFunctionDefinition } from '../types/function-definition.ts';
import { addFunctionPropertiesFrom } from './shared.ts';
import { stellarCommonFunctionDescription } from './stellar-shared.ts';
import { stellarCommonDescriptions, stellarFungibleDescriptions, stellarNonFungibleDescriptions } from '../../../../common/src/ai/descriptions/stellar.ts';

export const stellarFungibleAIFunctionDefinition = {
  name: 'Fungible',
  description: 'Fungible Token Standard, compatible with SEP-41, similar to ERC-20',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(stellarCommonFunctionDescription, [
        'name',
        'symbol',
        'burnable',
        'pausable',
        'upgradeable',
        'mintable',
        'access',
        'info',
      ]),
      premint: {
        type: 'string',
        description: stellarFungibleDescriptions.premint,
      },
    },
    required: ['name', 'symbol'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'stellar', 'Fungible'>;

export const stellarNonFungibleAIFunctionDefinition = {
  name: 'NonFungible',
  description: 'Non-Fungible Token Standard, compatible with SEP-50, similar to ERC-721',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(stellarCommonFunctionDescription, [
        'name',
        'symbol',
        'burnable',
        'pausable',
        'upgradeable',
        'mintable',
        'access',
        'info',
      ]),
      enumerable: {
        type: 'boolean',
        description: stellarNonFungibleDescriptions.enumerable,
      },
      consecutive: {
        type: 'boolean',
        description: stellarNonFungibleDescriptions.consecutive,
      },
      sequential: {
        type: 'boolean',
        description: stellarNonFungibleDescriptions.sequential,
      },
      upgradeable: {
        type: 'boolean',
        description: stellarCommonDescriptions.upgradeable,
      },
    },
    required: ['name', 'symbol'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'stellar', 'NonFungible'>;
