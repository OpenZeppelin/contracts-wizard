import type { AiFunctionDefinition } from '../types/function-definition.ts';
import { addFunctionPropertiesFrom } from './shared.ts';
import { stylusCommonFunctionDescription } from './stylus-shared.ts';

export const erc20Function = {
  name: 'ERC20',
  description: 'Make a fungible token per the ERC-20 standard',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(stylusCommonFunctionDescription, ['name', 'burnable', 'access', 'info']),
      permit: {
        type: 'boolean',
        description:
          'Whether without paying gas, token holders will be able to allow third parties to transfer from their account.',
      },
      flashmint: {
        type: 'boolean',
        description:
          "Whether to include built-in flash loans to allow lending tokens without requiring collateral as long as they're returned in the same transaction.",
      },
    },
    required: ['name'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'stylus', 'ERC20'>;

export const erc721Function = {
  name: 'ERC721',
  description: 'Make a non-fungible token per the ERC-721 standard',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(stylusCommonFunctionDescription, ['name', 'burnable', 'access', 'info']),
      enumerable: {
        type: 'boolean',
        description:
          'Whether to allow on-chain enumeration of all tokens or those owned by an account. Increases gas cost of transfers.',
      },
    },
    required: ['name'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'stylus', 'ERC721'>;

export const erc1155Function = {
  name: 'ERC1155',
  description: 'Make a non-fungible token per the ERC-1155 standard',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(stylusCommonFunctionDescription, ['name', 'burnable', 'access', 'info']),
      supply: {
        type: 'boolean',
        description: 'Whether to keep track of total supply of tokens',
      },
    },
    required: ['name'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'stylus', 'ERC1155'>;
