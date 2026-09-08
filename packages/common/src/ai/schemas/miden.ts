import { z } from 'zod';
import {
  commonDescriptions,
  infoDescriptions,
  midenCommonDescriptions,
  midenFungibleDescriptions,
  midenNonFungibleDescriptions,
} from '../../index';

export const midenCommonSchema = {
  burnable: z.boolean().optional().describe(midenCommonDescriptions.burnable),
  pausable: z.boolean().optional().describe(midenCommonDescriptions.pausable),
  restrictions: z
    .literal(false)
    .or(z.literal('allowlist'))
    .or(z.literal('blocklist'))
    .optional()
    .describe(midenCommonDescriptions.restrictions),
  switchablePolicies: z.boolean().optional().describe(midenCommonDescriptions.switchablePolicies),
  access: z
    .literal(false)
    .or(z.literal('ownable'))
    .or(z.literal('roles'))
    .optional()
    .describe(midenCommonDescriptions.access),
  info: z
    .object({
      securityContact: z.string().optional().describe(infoDescriptions.securityContact),
      license: z.string().optional().describe(infoDescriptions.license),
    })
    .optional()
    .describe(infoDescriptions.info),
} as const satisfies z.ZodRawShape;

export const midenFungibleSchema = {
  name: z.string().describe(commonDescriptions.name),
  symbol: z.string().describe(commonDescriptions.symbol),
  decimals: z.string().optional().describe(midenFungibleDescriptions.decimals),
  maxSupply: z.string().optional().describe(midenFungibleDescriptions.maxSupply),
  description: z.string().optional().describe(midenCommonDescriptions.description),
  logoUri: z.string().optional().describe(midenCommonDescriptions.logoUri),
  externalLink: z.string().optional().describe(midenFungibleDescriptions.externalLink),
  updatableMetadata: z.boolean().optional().describe(midenCommonDescriptions.updatableMetadata),
  updatableMaxSupply: z.boolean().optional().describe(midenFungibleDescriptions.updatableMaxSupply),
  burnable: midenCommonSchema.burnable,
  minBurnAmount: z.string().optional().describe(midenFungibleDescriptions.minBurnAmount),
  pausable: midenCommonSchema.pausable,
  restrictions: midenCommonSchema.restrictions,
  switchablePolicies: midenCommonSchema.switchablePolicies,
  access: midenCommonSchema.access,
  info: midenCommonSchema.info,
} as const satisfies z.ZodRawShape;

export const midenNonFungibleSchema = {
  name: z.string().describe(commonDescriptions.name),
  symbol: z.string().describe(commonDescriptions.symbol),
  description: z.string().optional().describe(midenCommonDescriptions.description),
  logoUri: z.string().optional().describe(midenCommonDescriptions.logoUri),
  contractUri: z.string().optional().describe(midenNonFungibleDescriptions.contractUri),
  updatableMetadata: z.boolean().optional().describe(midenCommonDescriptions.updatableMetadata),
  ...midenCommonSchema,
} as const satisfies z.ZodRawShape;
