import { z } from 'zod';
import {
  commonDescriptions,
  infoDescriptions,
  stellarCommonDescriptions,
  stellarFungibleDescriptions,
  stellarNonFungibleDescriptions,
  stellarStablecoinDescriptions,
} from '@openzeppelin/wizard-common';
import type { KindedOptions } from '@openzeppelin/wizard-stellar';

/**
 * Static type assertions to ensure schemas satisfy the Wizard API types. Not called at runtime.
 */
function _typeAssertions() {
  const _assertions: {
    [K in keyof KindedOptions]: Omit<KindedOptions[K], 'kind'>;
  } = {
    Fungible: z.object(fungibleSchema).parse({}),
    Stablecoin: z.object(stablecoinSchema).parse({}),
    NonFungible: z.object(nonFungibleSchema).parse({}),
  };
}

export const commonSchema = {
  access: z.literal('ownable').or(z.literal('roles')).optional().describe(stellarCommonDescriptions.access),
  upgradeable: z.boolean().optional().describe(stellarCommonDescriptions.upgradeable),
  info: z
    .object({
      securityContact: z.string().optional().describe(infoDescriptions.securityContact),
      license: z.string().optional().describe(infoDescriptions.license),
    })
    .optional()
    .describe(infoDescriptions.info),
} as const satisfies z.ZodRawShape;

export const fungibleSchema = {
  name: z.string().describe(commonDescriptions.name),
  symbol: z.string().describe(commonDescriptions.symbol),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  pausable: z.boolean().optional().describe(commonDescriptions.pausable),
  premint: z.string().optional().describe(stellarFungibleDescriptions.premint),
  mintable: z.boolean().optional().describe(commonDescriptions.mintable),
  ...commonSchema,
} as const satisfies z.ZodRawShape;

export const stablecoinSchema = {
  ...fungibleSchema,
  limitations: z
    .literal(false)
    .or(z.literal('allowlist'))
    .or(z.literal('blocklist'))
    .optional()
    .describe(stellarStablecoinDescriptions.limitations),
} as const satisfies z.ZodRawShape;

export const nonFungibleSchema = {
  name: z.string().describe(commonDescriptions.name),
  symbol: z.string().describe(commonDescriptions.symbol),
  baseUri: z.string().describe(stellarNonFungibleDescriptions.baseUri),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  enumerable: z.boolean().optional().describe(stellarNonFungibleDescriptions.enumerable),
  consecutive: z.boolean().optional().describe(stellarNonFungibleDescriptions.consecutive),
  pausable: z.boolean().optional().describe(commonDescriptions.pausable),
  mintable: z.boolean().optional().describe(commonDescriptions.mintable),
  sequential: z.boolean().optional().describe(stellarNonFungibleDescriptions.sequential),
  ...commonSchema,
} as const satisfies z.ZodRawShape;
