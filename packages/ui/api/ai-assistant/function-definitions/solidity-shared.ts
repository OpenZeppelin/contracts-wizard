import type { AiFunctionPropertyDefinition, SimpleAiFunctionDefinition } from '../types/function-definition.ts';
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

/** Keep Solidity-only integrations out of network-specific assistant capabilities. */
export function withoutChainlinkIntegrations<T extends SimpleAiFunctionDefinition>(definition: T, description: string) {
  return {
    ...definition,
    description,
    parameters: {
      ...definition.parameters,
      properties: {
        ...definition.parameters.properties,
        crossChainBridging: {
          anyOf: [
            { type: 'boolean', enum: [false] },
            { type: 'string', enum: ['custom', 'erc7786native', 'superchain'] },
          ],
          description:
            'Bridge mode: custom, ERC-7786 native, or Superchain. Availability depends on the selected network.',
        },
        chainlinkAce: {
          type: 'boolean',
          enum: [false],
          description: 'External policy integration is not supported on this network.',
        },
        info: commonFunctionDescription.info,
      },
    },
  } as const;
}
