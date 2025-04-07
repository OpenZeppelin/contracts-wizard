import type { AiFunctionPropertyDefinition } from '../types/function-definition.ts';
import type { StellarCommonContractOptions, StellarCommonOptions } from '../types/stellar.ts';

export const commonFunctionDescription = {
  access: {
    anyOf: [
      { type: 'string', enum: ['ownable'] },
      { type: 'boolean', enum: [false] },
    ],
    description:
      'The type of access control to provision. Ownable is a simple mechanism with a single account authorized for all privileged actions. Roles is a flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts. Managed enables a central contract to define a policy that allows certain callers to access certain functions.',
  },

  info: {
    type: 'object',
    description: 'Metadata about the contract and author',
    properties: {
      license: {
        type: 'string',
        description: 'The license used by the contract, default is "MIT"',
      },
    },
  },
} as const satisfies AiFunctionPropertyDefinition<StellarCommonOptions & StellarCommonContractOptions>['properties'];
