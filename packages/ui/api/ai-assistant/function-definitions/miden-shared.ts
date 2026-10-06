import type { AiFunctionPropertyDefinition } from '../types/function-definition.ts';
import type { MidenCommonContractOptions } from '../types/languages.ts';
import { infoDescriptions } from '../../../../common/src/ai/descriptions/common.ts';
import { midenCommonDescriptions } from '../../../../common/src/ai/descriptions/miden.ts';
import { extractStringEnumValues } from '../types/helpers.ts';
import type { Access, TransferPolicy } from '../../../../core/miden/dist/common-options';

/**
 * Options shared by the Miden Fungible and NonFungible contracts, beyond the common contract options.
 */
type MidenSharedOptions = MidenCommonContractOptions & {
  transferPolicy?: TransferPolicy;
  switchableTransferPolicy?: boolean;
  description?: string;
  logoUri?: string;
};

export const midenCommonFunctionDescription = {
  access: {
    type: 'string',
    enum: extractStringEnumValues<Access>()(['singleKey', 'ownable', 'roles']),
    description: midenCommonDescriptions.access,
  },

  transferPolicy: {
    anyOf: [
      { type: 'boolean', enum: [false] },
      { type: 'string', enum: extractStringEnumValues<TransferPolicy>()(['allowlist', 'blocklist']) },
    ],
    description: midenCommonDescriptions.transferPolicy,
  },

  switchableTransferPolicy: {
    type: 'boolean',
    description: midenCommonDescriptions.switchableTransferPolicy,
  },

  description: {
    type: 'string',
    description: midenCommonDescriptions.description,
  },

  logoUri: {
    type: 'string',
    description: midenCommonDescriptions.logoUri,
  },

  info: {
    type: 'object',
    description: infoDescriptions.info,
    properties: {
      securityContact: {
        type: 'string',
        description: midenCommonDescriptions.securityContact,
      },

      license: {
        type: 'string',
        description: infoDescriptions.license,
      },
    },
  },
} as const satisfies AiFunctionPropertyDefinition<MidenSharedOptions>['properties'];
