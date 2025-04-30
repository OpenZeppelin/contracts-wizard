import type { AiFunctionDefinition } from '../types/function-definition.ts';
import { addFunctionPropertiesFrom } from './shared.ts';
import { stellarCommonFunctionDescription } from './stellar-shared.ts';

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
        'mintable',
        'access',
        'info',
      ]),
      premint: {
        type: 'string',
        description: 'The number of tokens to premint for the deployer.',
      },
      upgradeable: {
        type: 'boolean',
        description: 'Whether the contract can be upgraded.',
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
        'mintable',
        'access',
        'info',
      ]),
      premint: {
        type: 'string',
        description: 'The number of tokens to premint for the deployer.',
      },
      enumerable: {
        type: 'boolean',
        description: 'Whether the NFTs are enumerable (can be iterated over).',
      },
      consecutive: {
        type: 'boolean',
        description: 'To batch mint NFTs instead of minting them individually (sequential minting is mandatory).',
      },
      sequential: {
        type: 'boolean',
        description: 'Whether the IDs of the minted NFTs will be sequential.',
      },
      upgradeable: {
        type: 'boolean',
        description: 'Whether the contract can be upgraded.',
      },
    },
    required: ['name', 'symbol'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'stellar', 'NonFungible'>;
