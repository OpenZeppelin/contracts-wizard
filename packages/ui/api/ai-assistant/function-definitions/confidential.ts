import type { AiFunctionDefinition } from '../types/function-definition.ts';
import { addFunctionPropertiesFrom } from './shared.ts';
import { commonFunctionDescription } from './confidential-shared.ts';
import {
  confidentialPrompts,
  confidentialConfidentialFungibleDescriptions,
} from '../../../../common/src/ai/descriptions/confidential.ts';

export const confidentialConfidentialFungibleAIFunctionDefinition = {
  name: 'ConfidentialFungible',
  description: confidentialPrompts.ConfidentialFungible,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(commonFunctionDescription, ['name', 'symbol', 'info']),
      tokenURI: {
        type: 'string',
        description: confidentialConfidentialFungibleDescriptions.tokenURI,
      },
      premint: {
        type: 'string',
        description: confidentialConfidentialFungibleDescriptions.premint,
      },
      networkConfig: {
        anyOf: [{ type: 'string', enum: ['zama-sepolia', 'zama-ethereum'] }],
        description: confidentialConfidentialFungibleDescriptions.networkConfig,
      },
      wrappable: {
        type: 'boolean',
        description: confidentialConfidentialFungibleDescriptions.wrappable,
      },
      votes: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: ['blocknumber', 'timestamp'] },
        ],
        description: confidentialConfidentialFungibleDescriptions.votes,
      },
    },
    required: ['name', 'symbol', 'tokenURI', 'networkConfig'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'confidential', 'ConfidentialFungible'>;
