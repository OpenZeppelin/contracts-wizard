import type { AiFunctionDefinition } from '../types/function-definition.ts';
import { addFunctionPropertiesFrom } from './shared.ts';
import { commonFunctionDescription } from './confidential-shared.ts';
import {
  confidentialPrompts,
  confidentialERC7984Descriptions,
} from '../../../../common/src/ai/descriptions/confidential.ts';

export const confidentialERC7984AIFunctionDefinition = {
  name: 'ERC7984',
  description: confidentialPrompts.ERC7984,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(commonFunctionDescription, ['name', 'symbol', 'info']),
      tokenURI: {
        type: 'string',
        description: confidentialERC7984Descriptions.tokenURI,
      },
      premint: {
        type: 'string',
        description: confidentialERC7984Descriptions.premint,
      },
      networkConfig: {
        anyOf: [{ type: 'string', enum: ['zama-sepolia', 'zama-ethereum'] }],
        description: confidentialERC7984Descriptions.networkConfig,
      },
      wrappable: {
        type: 'boolean',
        description: confidentialERC7984Descriptions.wrappable,
      },
      votes: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: ['blocknumber', 'timestamp'] },
        ],
        description: confidentialERC7984Descriptions.votes,
      },
    },
    required: ['name', 'symbol', 'tokenURI', 'networkConfig'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'confidential', 'ERC7984'>;
