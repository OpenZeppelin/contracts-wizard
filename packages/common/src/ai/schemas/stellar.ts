import { z } from 'zod';
import {
  commonDescriptions,
  infoDescriptions,
  stellarCommonDescriptions,
  stellarFungibleDescriptions,
  stellarNonFungibleDescriptions,
  stellarStablecoinDescriptions,
} from '../../index';

export const stellarCommonSchema = {
  access: z.literal('ownable').or(z.literal('roles')).optional().describe(stellarCommonDescriptions.access),
  explicitImplementations: z.boolean().optional().describe(stellarCommonDescriptions.explicitImplementations),
  upgradeable: z.boolean().optional().describe(stellarCommonDescriptions.upgradeable),
  info: z
    .object({
      securityContact: z.string().optional().describe(infoDescriptions.securityContact),
      license: z.string().optional().describe(infoDescriptions.license),
    })
    .optional()
    .describe(infoDescriptions.info),
} as const satisfies z.ZodRawShape;

export const stellarFungibleSchema = {
  name: z.string().describe(commonDescriptions.name),
  symbol: z.string().describe(commonDescriptions.symbol),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  pausable: z.boolean().optional().describe(commonDescriptions.pausable),
  premint: z.string().optional().describe(stellarFungibleDescriptions.premint),
  mintable: z.boolean().optional().describe(commonDescriptions.mintable),
  ...stellarCommonSchema,
} as const satisfies z.ZodRawShape;

export const stellarStablecoinSchema = {
  ...stellarFungibleSchema,
  limitations: z
    .literal(false)
    .or(z.literal('allowlist'))
    .or(z.literal('blocklist'))
    .optional()
    .describe(stellarStablecoinDescriptions.limitations),
} as const satisfies z.ZodRawShape;

export const stellarNonFungibleSchema = {
  name: z.string().describe(commonDescriptions.name),
  symbol: z.string().describe(commonDescriptions.symbol),
  tokenUri: z.string().optional().describe(stellarNonFungibleDescriptions.tokenUri),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  enumerable: z.boolean().optional().describe(stellarNonFungibleDescriptions.enumerable),
  consecutive: z.boolean().optional().describe(stellarNonFungibleDescriptions.consecutive),
  pausable: z.boolean().optional().describe(commonDescriptions.pausable),
  mintable: z.boolean().optional().describe(commonDescriptions.mintable),
  sequential: z.boolean().optional().describe(stellarNonFungibleDescriptions.sequential),
  ...stellarCommonSchema,
} as const satisfies z.ZodRawShape;
