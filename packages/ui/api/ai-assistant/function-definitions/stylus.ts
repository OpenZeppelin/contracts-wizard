import type { AiFunctionDefinition } from '../types/function-definition.ts';
import { addFunctionPropertiesFrom } from './shared.ts';
import { stylusCommonFunctionDescription } from './stylus-shared.ts';
import { stylusPrompts, stylusCommonDescriptions, stylusERC20Descriptions, stylusERC721Descriptions, stylusERC1155Descriptions } from '../../../../common/src/ai/descriptions/stylus.ts';

export const stylusERC20AIFunctionDefinition = {
  name: 'ERC20',
  description: stylusPrompts.ERC20,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(stylusCommonFunctionDescription, ['name', 'burnable', 'access', 'info']),
      permit: {
        type: 'boolean',
        description: stylusERC20Descriptions.permit,
      },
      flashmint: {
        type: 'boolean',
        description: stylusERC20Descriptions.flashmint,
      },
    },
    required: ['name'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'stylus', 'ERC20'>;

export const stylusERC721AIFunctionDefinition = {
  name: 'ERC721',
  description: stylusPrompts.ERC721,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(stylusCommonFunctionDescription, ['name', 'burnable', 'access', 'info']),
      enumerable: {
        type: 'boolean',
        description: stylusERC721Descriptions.enumerable,
      },
    },
    required: ['name'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'stylus', 'ERC721'>;

export const stylusERC1155AIFunctionDefinition = {
  name: 'ERC1155',
  description: stylusPrompts.ERC1155,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(stylusCommonFunctionDescription, ['name', 'burnable', 'access', 'info']),
      supply: {
        type: 'boolean',
        description: stylusERC1155Descriptions.supply,
      },
    },
    required: ['name'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'stylus', 'ERC1155'>;
