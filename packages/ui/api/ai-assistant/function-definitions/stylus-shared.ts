import type { AiFunctionPropertyDefinition } from '../types/function-definition.ts';
import type { StylusCommonContractOptions } from '../types/languages.ts';

export const stylusCommonFunctionDescription = {
  access: {
    type: 'boolean',
    enum: [false],
    description: 'The type of access control to provision, currently not supported',
    // 'The type of access control to provision. Ownable is a simple mechanism with a single account authorized for all privileged actions. Roles is a flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.',
  },

  info: {
    type: 'object',
    description: 'Metadata about the contract and author',
    properties: {
      securityContact: {
        type: 'string',
        description:
          'Email where people can contact you to report security issues. Will only be visible if contract metadata is verified.',
      },

      license: {
        type: 'string',
        description: 'The license used by the contract, default is "MIT"',
      },
    },
  },
} as const satisfies AiFunctionPropertyDefinition<StylusCommonContractOptions>['properties'];
