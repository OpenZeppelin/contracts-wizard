import type { AiFunctionDefinition } from '../types/function-definition.ts';
import { addFunctionPropertiesFrom } from './shared.ts';
import { commonFunctionDescription } from './zama-shared.ts';
import {
  zamaPrompts,
  zamaConfidentialFungibleDescriptions,
} from '../../../../common/src/ai/descriptions/zama.ts';

export const zamaConfidentialFungibleAIFunctionDefinition = {
  name: 'ConfidentialFungible',
  description: zamaPrompts.ConfidentialFungible,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(commonFunctionDescription, [
        'name',
        'symbol',
        'info',
      ]),
      tokenURI: {
        type: 'string',
        description: zamaConfidentialFungibleDescriptions.tokenURI,
      },
      premint: {
        type: 'string',
        description: zamaConfidentialFungibleDescriptions.premint,
      },
      networkConfig: {
        anyOf: [
          { type: 'string', enum: ['zama-sepolia', 'zama-ethereum'] },
        ],
        description: zamaConfidentialFungibleDescriptions.networkConfig,
      },
      wrappable: {
        type: 'boolean',
        description: zamaConfidentialFungibleDescriptions.wrappable,
      },
      votes: {
        anyOf: [
          { type: 'boolean', enum: [false, true] },
          { type: 'string', enum: ['blocknumber', 'timestamp'] },
        ],
        description: zamaConfidentialFungibleDescriptions.votes,
      },

    },
    required: ['name', 'symbol', 'tokenURI', 'networkConfig'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'zama', 'ConfidentialFungible'>;
