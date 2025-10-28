import type { AiFunctionPropertyDefinition } from '../types/function-definition.ts';
import type { CairoAlphaCommonContractOptions, CairoAlphaRoyaltyInfoOptions } from '../types/languages.ts';
import { infoDescriptions } from '../../../../common/src/ai/descriptions/common.ts';
import {
  cairoCommonDescriptions,
  cairoAlphaAccessDescriptions,
  cairoRoyaltyInfoDescriptions,
} from '../../../../common/src/ai/descriptions/cairo.ts';

const commonContractFunctionDescription = {
  upgradeable: {
    type: 'boolean',
    description: cairoCommonDescriptions.upgradeable,
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

  access: {
    type: 'object',
    properties: {
      type: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: ['ownable', 'roles', 'roles-dar'] },
        ],
        description: cairoAlphaAccessDescriptions.accessType,
      },
      darInitialDelay: {
        type: 'string',
        description: cairoAlphaAccessDescriptions.darInitialDelay,
      },
      darDefaultDelayIncrease: {
        type: 'string',
        description: cairoAlphaAccessDescriptions.darDefaultDelayIncrease,
      },
    },
    description: cairoCommonDescriptions.access,
  },
} as const satisfies AiFunctionPropertyDefinition<CairoAlphaCommonContractOptions>['properties'];

export const cairoAlphaSharedFunctionDefinition = {
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
  { royaltyInfo: CairoAlphaRoyaltyInfoOptions } & { appName: string; appVersion: string }
>['properties'];
