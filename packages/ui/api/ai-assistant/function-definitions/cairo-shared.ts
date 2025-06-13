import type { AiFunctionPropertyDefinition } from '../types/function-definition.ts';
import type { CairoCommonContractOptions, CairoRoyaltyInfoOptions } from '../types/languages.ts';
import { cairoCommonDescriptions, cairoRoyaltyInfoDescriptions } from '../../../../common/src/ai/descriptions/cairo.ts';

const commonContractFunctionDescription = {
  upgradeable: {
    type: 'boolean',
    description: cairoCommonDescriptions.upgradeable,
  },

  info: {
    type: 'object',
    description: cairoCommonDescriptions.info,
    properties: {
      license: {
        type: 'string',
        description: cairoCommonDescriptions.license,
      },
    },
  },

  access: {
    anyOf: [
      { type: 'boolean', enum: [false] },
      { type: 'string', enum: ['ownable', 'roles'] },
    ],
    description: cairoCommonDescriptions.access,
  },
} as const satisfies AiFunctionPropertyDefinition<CairoCommonContractOptions>['properties'];

export const cairoSharedFunctionDefinition = {
  ...commonContractFunctionDescription,

  appName: {
    type: 'string',
    description: cairoCommonDescriptions.appName,
  },

  appVersion: {
    type: 'string',
    description: cairoCommonDescriptions.appVersion,
  },

  royaltyInfo: {
    type: 'object',
    description: cairoCommonDescriptions.royaltyInfo,
    properties: {
      enabled: {
        type: 'boolean',
        description: cairoRoyaltyInfoDescriptions.enabled,
      },
      defaultRoyaltyFraction: {
        type: 'string',
        description: cairoRoyaltyInfoDescriptions.defaultRoyaltyFraction,
      },
      feeDenominator: {
        type: 'string',
        description: cairoRoyaltyInfoDescriptions.feeDenominator,
      },
    },
  },
} as const satisfies AiFunctionPropertyDefinition<
  { royaltyInfo: CairoRoyaltyInfoOptions } & { appName: string; appVersion: string }
>['properties'];
