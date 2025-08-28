import type { AiFunctionPropertyDefinition } from '../types/function-definition.ts';
import type { ZamaCommonOptions } from '../types/languages.ts';
import { infoDescriptions } from '../../../../common/src/ai/descriptions/common.ts';

export const commonFunctionDescription = {
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
} as const satisfies AiFunctionPropertyDefinition<ZamaCommonOptions>['properties'];
