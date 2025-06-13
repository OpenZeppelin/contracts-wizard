import type { AiFunctionPropertyDefinition } from '../types/function-definition.ts';
import type { StellarCommonContractOptions } from '../types/languages.ts';

export const stellarCommonFunctionDescription = {
  access: {
    type: 'boolean',
    enum: [false],
    description: 'The type of access control to provision, currently not supported',
    // 'The type of access control to provision. Ownable is a simple mechanism with a single account authorized for all privileged actions.',
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
} as const satisfies AiFunctionPropertyDefinition<StellarCommonContractOptions>['properties'];
