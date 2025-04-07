import type { AiFunctionDefinition } from '../types/function-definition.ts';
import { addFunctionPropertiesFrom } from './shared.ts';
import { commonFunctionDescription } from './stellar-shared.ts';

export const fungibleFunction = {
  name: 'Fungible',
  description: 'Make a fungible token per the ERC-20 standard',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(commonFunctionDescription, [
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
    },
    required: ['name', 'symbol'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'stellar', 'Fungible'>;
