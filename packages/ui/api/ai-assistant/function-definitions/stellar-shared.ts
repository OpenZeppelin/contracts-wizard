import type { AiFunctionPropertyDefinition } from '../types/function-definition.ts';
import type { StellarCommonContractOptions } from '../types/languages.ts';
import { infoDescriptions } from '../../../../common/src/ai/descriptions/common.ts';
import { stellarCommonDescriptions } from '../../../../common/src/ai/descriptions/stellar.ts';
import { extractStringEnumValues } from '../types/helpers.ts';
import type { Access } from '../../../../core/stellar/dist/set-access-control';

export const stellarCommonFunctionDescription = {
  access: {
    anyOf: [
      { type: 'string', enum: extractStringEnumValues<Access>()(['ownable', 'roles']) },
      { type: 'boolean', enum: [false] },
    ],
    description: stellarCommonDescriptions.access,
  },

  upgradeable: {
    type: 'boolean',
    description: stellarCommonDescriptions.upgradeable,
  },

  explicitImplementations: {
    type: 'boolean',
    description: stellarCommonDescriptions.explicitImplementations,
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
