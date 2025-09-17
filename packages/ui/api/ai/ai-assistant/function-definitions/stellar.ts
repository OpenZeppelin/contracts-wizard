import type { AiFunctionDefinition } from '../types/function-definition.ts';
import { addFunctionPropertiesFrom } from './shared.ts';
import { stellarCommonFunctionDescription } from './stellar-shared.ts';
import {
  stellarPrompts,
  stellarCommonDescriptions,
  stellarFungibleDescriptions,
  stellarNonFungibleDescriptions,
  stellarStablecoinDescriptions,
} from '../../../../../common/src/ai/descriptions/stellar.ts';

export const stellarFungibleAIFunctionDefinition = {
  name: 'Fungible',
  description: stellarPrompts.Fungible,
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

export const stellarStablecoinAIFunctionDefinition = {
  name: 'Stablecoin',
  description: stellarPrompts.Stablecoin,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(stellarCommonFunctionDescription, [
        'name',
        'symbol',
        'burnable',
        'pausable',
        'mintable',
        'access',
        'info',
      ]),
      limitations: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: ['allowlist', 'blocklist'] },
        ],
        description: stellarStablecoinDescriptions.limitations,
      },
      premint: {
        type: 'string',
        description: stellarStablecoinDescriptions.premint,
      },
      upgradeable: {
        type: 'boolean',
        description: stellarCommonDescriptions.upgradeable,
      },
    },
    required: ['name', 'symbol'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'stellar', 'Stablecoin'>;

export const stellarNonFungibleAIFunctionDefinition = {
  name: 'NonFungible',
  description: stellarPrompts.NonFungible,
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
