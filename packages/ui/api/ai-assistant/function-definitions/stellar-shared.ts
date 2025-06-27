import type { AiFunctionPropertyDefinition } from '../types/function-definition.ts';
import type { StellarCommonContractOptions } from '../types/languages.ts';
import { infoDescriptions } from '../../../../common/src/ai/descriptions/common.ts';
import { stellarCommonDescriptions } from '../../../../common/src/ai/descriptions/stellar.ts';

export const stellarCommonFunctionDescription = {
  access: {
    type: 'boolean',
    enum: [false],
    description: 'The type of access control to provision, currently not supported',
    // 'The type of access control to provision. Ownable is a simple mechanism with a single account authorized for all privileged actions.',
  },

  upgradeable: {
    type: 'boolean',
    description: stellarCommonDescriptions.upgradeable,
  },

  info: {
    type: 'object',
    description: infoDescriptions.info,
    properties: {
      securityContact: {
        type: 'string',
        description: infoDescriptions.securityContact,
      },

      license: {
        type: 'string',
        description: infoDescriptions.license,
      },
    },
  },
} as const satisfies AiFunctionPropertyDefinition<StellarCommonContractOptions>['properties'];
