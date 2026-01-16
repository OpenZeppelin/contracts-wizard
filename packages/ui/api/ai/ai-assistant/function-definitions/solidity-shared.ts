import type { AiFunctionPropertyDefinition } from '../types/function-definition.ts';
import type { SolidityCommonOptions } from '../types/languages.ts';
import { infoDescriptions } from '../../../../common/src/ai/descriptions/common.ts';
import { solidityCommonDescriptions } from '../../../../common/src/ai/descriptions/solidity.ts';
import { extractStringEnumValues } from '../types/helpers.ts';
import type { Access, Upgradeable } from '@openzeppelin/wizard';

export const commonFunctionDescription = {
  access: {
    anyOf: [
      { type: 'string', enum: extractStringEnumValues<Access>()(['ownable', 'roles', 'managed']) },
      { type: 'boolean', enum: [false] },
    ],
    description: solidityCommonDescriptions.access,
  },

  upgradeable: {
    anyOf: [
      { type: 'string', enum: extractStringEnumValues<Upgradeable>()(['transparent', 'uups']) },
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
