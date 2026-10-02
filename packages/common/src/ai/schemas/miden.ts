import { z } from 'zod';
import {
  commonDescriptions,
  infoDescriptions,
  midenCommonDescriptions,
  midenFungibleDescriptions,
  midenNonFungibleDescriptions,
} from '../../index';

export const midenCommonSchema = {
  pausable: z.boolean().optional().describe(midenCommonDescriptions.pausable),
  pausableTransfers: z.boolean().optional().describe(midenCommonDescriptions.pausableTransfers),
  transferPolicy: z
    .literal(false)
    .or(z.literal('allowlist'))
    .or(z.literal('blocklist'))
    .optional()
    .describe(midenCommonDescriptions.transferPolicy),
  switchableTransferPolicy: z.boolean().optional().describe(midenCommonDescriptions.switchableTransferPolicy),
  access: z
    .literal('singleKey')
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
  maxSupply: z.string().describe(midenFungibleDescriptions.maxSupply),
  description: z.string().optional().describe(midenCommonDescriptions.description),
  logoUri: z.string().optional().describe(midenCommonDescriptions.logoUri),
  externalLink: z.string().optional().describe(midenFungibleDescriptions.externalLink),
  updatableMetadata: z.boolean().optional().describe(midenFungibleDescriptions.updatableMetadata),
  updatableMaxSupply: z.boolean().optional().describe(midenFungibleDescriptions.updatableMaxSupply),
  burnPolicy: z
    .literal('anyHolder')
    .or(z.literal('minimumAmount'))
    .or(z.literal('ownerOnly'))
    .optional()
    .describe(midenFungibleDescriptions.burnPolicy),
  minBurnAmount: z.string().optional().describe(midenFungibleDescriptions.minBurnAmount),
  ...midenCommonSchema,
} as const satisfies z.ZodRawShape;

export const midenNonFungibleSchema = {
  name: z.string().describe(commonDescriptions.name),
  symbol: z.string().describe(commonDescriptions.symbol),
  description: z.string().optional().describe(midenCommonDescriptions.description),
  logoUri: z.string().optional().describe(midenCommonDescriptions.logoUri),
  contractUri: z.string().optional().describe(midenNonFungibleDescriptions.contractUri),
  updatableMetadata: z.boolean().optional().describe(midenNonFungibleDescriptions.updatableMetadata),
  burnPolicy: z
    .literal('anyHolder')
    .or(z.literal('ownerOnly'))
    .optional()
    .describe(midenNonFungibleDescriptions.burnPolicy),
  ...midenCommonSchema,
} as const satisfies z.ZodRawShape;
