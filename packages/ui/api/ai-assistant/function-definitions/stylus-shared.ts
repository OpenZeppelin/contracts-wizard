import type { AiFunctionPropertyDefinition } from '../types/function-definition.ts';
import type { StylusCommonContractOptions } from '../types/languages.ts';
import { commonDescriptions } from '../../../../common/src/ai/descriptions/common.ts';

export const stylusCommonFunctionDescription = {
  access: {
    type: 'boolean',
    enum: [false],
    description: 'The type of access control to provision, currently not supported',
    // 'The type of access control to provision. Ownable is a simple mechanism with a single account authorized for all privileged actions. Roles is a flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.',
  },

  info: {
    type: 'object',
    description: commonDescriptions.info,
    properties: {
      securityContact: {
        type: 'string',
        description: commonDescriptions.securityContact,
      },

      license: {
        type: 'string',
        description: commonDescriptions.license,
      },
    },
  },
} as const satisfies AiFunctionPropertyDefinition<StylusCommonContractOptions>['properties'];
