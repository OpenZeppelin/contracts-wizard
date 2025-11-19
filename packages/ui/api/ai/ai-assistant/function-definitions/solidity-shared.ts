import type { AiFunctionPropertyDefinition } from '../types/function-definition.ts';
import type { SolidityCommonOptions } from '../types/languages.ts';
import { infoDescriptions } from '../../../../../common/src/ai/descriptions/common.ts';
import { solidityCommonDescriptions } from '../../../../../common/src/ai/descriptions/solidity.ts';

export const commonFunctionDescription = {
  access: {
    anyOf: [
      { type: 'string', enum: ['ownable', 'roles', 'managed'] },
      { type: 'boolean', enum: [false] },
    ],
    description: solidityCommonDescriptions.access,
  },

  upgradeable: {
    anyOf: [
      { type: 'string', enum: ['transparent', 'uups'] },
      { type: 'boolean', enum: [false] },
    ],
    description: solidityCommonDescriptions.upgradeable,
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
} as const satisfies AiFunctionPropertyDefinition<SolidityCommonOptions>['properties'];
