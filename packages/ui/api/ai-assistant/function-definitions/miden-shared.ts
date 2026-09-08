import type { AiFunctionPropertyDefinition } from '../types/function-definition.ts';
import type { MidenCommonContractOptions } from '../types/languages.ts';
import { infoDescriptions } from '../../../../common/src/ai/descriptions/common.ts';
import { midenCommonDescriptions } from '../../../../common/src/ai/descriptions/miden.ts';
import { extractStringEnumValues } from '../types/helpers.ts';
import type { Access, Restrictions } from '../../../../core/miden/dist/common-options';

/**
 * Options shared by the Miden Fungible and NonFungible contracts, beyond the common contract options.
 */
type MidenSharedOptions = MidenCommonContractOptions & {
  burnable?: boolean;
  pausable?: boolean;
  restrictions?: Restrictions;
  switchablePolicies?: boolean;
  description?: string;
  logoUri?: string;
  updatableMetadata?: boolean;
};

export const midenCommonFunctionDescription = {
  access: {
    anyOf: [
      { type: 'string', enum: extractStringEnumValues<Access>()(['ownable', 'roles']) },
      { type: 'boolean', enum: [false] },
    ],
    description: midenCommonDescriptions.access,
  },

  burnable: {
    type: 'boolean',
    description: midenCommonDescriptions.burnable,
  },

  pausable: {
    type: 'boolean',
    description: midenCommonDescriptions.pausable,
  },

  restrictions: {
    anyOf: [
      { type: 'boolean', enum: [false] },
      { type: 'string', enum: extractStringEnumValues<Restrictions>()(['allowlist', 'blocklist']) },
    ],
    description: midenCommonDescriptions.restrictions,
  },

  switchablePolicies: {
    type: 'boolean',
    description: midenCommonDescriptions.switchablePolicies,
  },

  description: {
    type: 'string',
    description: midenCommonDescriptions.description,
  },

  logoUri: {
    type: 'string',
    description: midenCommonDescriptions.logoUri,
  },

  updatableMetadata: {
    type: 'boolean',
    description: midenCommonDescriptions.updatableMetadata,
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
} as const satisfies AiFunctionPropertyDefinition<MidenSharedOptions>['properties'];
