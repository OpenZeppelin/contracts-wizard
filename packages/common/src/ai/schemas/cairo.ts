import { z } from 'zod';
import {
  commonDescriptions,
  infoDescriptions,
  cairoCommonDescriptions,
  cairoAccessDescriptions,
  cairoMacrosDescriptions,
  cairoERC20Descriptions,
  cairoERC721Descriptions,
  cairoRoyaltyInfoDescriptions,
  cairoERC1155Descriptions,
  cairoERC6909Descriptions,
  cairoAccountDescriptions,
  cairoGovernorDescriptions,
  cairoMultisigDescriptions,
  cairoVestingDescriptions,
} from '../../index';

export const cairoCommonSchema = {
  access: z
    .object({
      type: z
        .literal('ownable')
        .or(z.literal('roles'))
        .or(z.literal('roles-dar'))
        .or(z.literal(false))
        .describe(cairoAccessDescriptions.accessType),
      darInitialDelay: z.string().default('1 day').describe(cairoAccessDescriptions.darInitialDelay),
      darDefaultDelayIncrease: z.string().default('5 days').describe(cairoAccessDescriptions.darDefaultDelayIncrease),
      darMaxTransferDelay: z.string().default('30 days').describe(cairoAccessDescriptions.darMaxTransferDelay),
    })
    .optional(),
  upgradeable: z.boolean().optional().describe(cairoCommonDescriptions.upgradeable),
  info: z
    .object({
      securityContact: z.string().optional().describe(infoDescriptions.securityContact),
      license: z.string().optional().describe(infoDescriptions.license),
    })
    .optional()
    .describe(infoDescriptions.info),
  macros: z
    .object({
      withComponents: z.boolean().describe(cairoMacrosDescriptions.withComponents),
    })
    .optional()
    .describe(cairoMacrosDescriptions.macros),
} as const satisfies z.ZodRawShape;

export const cairoERC20Schema = {
  name: z.string().describe(commonDescriptions.name),
  symbol: z.string().describe(commonDescriptions.symbol),
  decimals: z.string().optional().describe(cairoERC20Descriptions.decimals),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  pausable: z.boolean().optional().describe(commonDescriptions.pausable),
  premint: z.string().optional().describe(cairoERC20Descriptions.premint),
  mintable: z.boolean().optional().describe(commonDescriptions.mintable),
  votes: z.boolean().optional().describe(cairoERC20Descriptions.votes),
  appName: z.string().optional().describe(cairoCommonDescriptions.appName),
  appVersion: z.string().optional().describe(cairoCommonDescriptions.appVersion),
  ...cairoCommonSchema,
} as const satisfies z.ZodRawShape;

export const cairoERC721Schema = {
  name: z.string().describe(commonDescriptions.name),
  symbol: z.string().describe(commonDescriptions.symbol),
  baseUri: z.string().optional().describe(cairoERC721Descriptions.baseUri),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  pausable: z.boolean().optional().describe(commonDescriptions.pausable),
  mintable: z.boolean().optional().describe(commonDescriptions.mintable),
  enumerable: z.boolean().optional().describe(cairoERC721Descriptions.enumerable),
  votes: z.boolean().optional().describe(cairoERC721Descriptions.votes),
  royaltyInfo: z
    .object({
      enabled: z.boolean().describe(cairoRoyaltyInfoDescriptions.enabled),
      defaultRoyaltyFraction: z.string().describe(cairoRoyaltyInfoDescriptions.defaultRoyaltyFraction),
      feeDenominator: z.string().describe(cairoRoyaltyInfoDescriptions.feeDenominator),
    })
    .optional()
    .describe(cairoCommonDescriptions.royaltyInfo),
  appName: z.string().optional().describe(cairoCommonDescriptions.appName),
  appVersion: z.string().optional().describe(cairoCommonDescriptions.appVersion),
  ...cairoCommonSchema,
} as const satisfies z.ZodRawShape;

export const cairoERC1155Schema = {
  name: z.string().describe(commonDescriptions.name),
  baseUri: z.string().describe(cairoERC1155Descriptions.baseUri),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  pausable: z.boolean().optional().describe(commonDescriptions.pausable),
  mintable: z.boolean().optional().describe(commonDescriptions.mintable),
  updatableUri: z.boolean().optional().describe(cairoERC1155Descriptions.updatableUri),
  royaltyInfo: z
    .object({
      enabled: z.boolean().describe(cairoRoyaltyInfoDescriptions.enabled),
      defaultRoyaltyFraction: z.string().describe(cairoRoyaltyInfoDescriptions.defaultRoyaltyFraction),
      feeDenominator: z.string().describe(cairoRoyaltyInfoDescriptions.feeDenominator),
    })
    .optional()
    .describe(cairoCommonDescriptions.royaltyInfo),
  ...cairoCommonSchema,
} as const satisfies z.ZodRawShape;

export const cairoERC6909Schema = {
  name: z.string().describe(commonDescriptions.name),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  pausable: z.boolean().optional().describe(commonDescriptions.pausable),
  mintable: z.boolean().optional().describe(commonDescriptions.mintable),
  contentUri: z.boolean().optional().describe(cairoERC6909Descriptions.contentUri),
  tokenSupply: z.boolean().optional().describe(cairoERC6909Descriptions.tokenSupply),
  metadata: z.boolean().optional().describe(cairoERC6909Descriptions.metadata),
  ...cairoCommonSchema,
} as const satisfies z.ZodRawShape;

export const cairoAccountSchema = {
  name: z.string().describe(commonDescriptions.name),
  type: z.enum(['stark', 'eth']).describe(cairoAccountDescriptions.type),
  declare: z.boolean().optional().describe(cairoAccountDescriptions.declare),
  deploy: z.boolean().optional().describe(cairoAccountDescriptions.deploy),
  pubkey: z.boolean().optional().describe(cairoAccountDescriptions.pubkey),
  outsideExecution: z.boolean().optional().describe(cairoAccountDescriptions.outsideExecution),
  upgradeable: cairoCommonSchema.upgradeable,
  info: cairoCommonSchema.info,
  macros: cairoCommonSchema.macros,
} as const satisfies z.ZodRawShape;

export const cairoMultisigSchema = {
  name: z.string().describe(commonDescriptions.name),
  quorum: z.string().describe(cairoMultisigDescriptions.quorum),
  upgradeable: cairoCommonSchema.upgradeable,
  info: cairoCommonSchema.info,
  macros: cairoCommonSchema.macros,
} as const satisfies z.ZodRawShape;

export const cairoGovernorSchema = {
  name: z.string().describe(commonDescriptions.name),
  delay: z.string().describe(cairoGovernorDescriptions.delay),
  period: z.string().describe(cairoGovernorDescriptions.period),
  votes: z.enum(['erc20votes', 'erc721votes']).optional().describe(cairoGovernorDescriptions.votes),
  clockMode: z.enum(['timestamp']).optional().describe(cairoGovernorDescriptions.clockMode),
  timelock: z
    .union([z.literal(false), z.literal('openzeppelin')])
    .optional()
    .describe(cairoGovernorDescriptions.timelock),
  decimals: z.number().optional().describe(cairoGovernorDescriptions.decimals),
  proposalThreshold: z.string().optional().describe(cairoGovernorDescriptions.proposalThreshold),
  quorumMode: z.enum(['percent', 'absolute']).optional().describe(cairoGovernorDescriptions.quorumMode),
  quorumPercent: z.number().optional().describe(cairoGovernorDescriptions.quorumPercent),
  quorumAbsolute: z.string().optional().describe(cairoGovernorDescriptions.quorumAbsolute),
  settings: z.boolean().optional().describe(cairoGovernorDescriptions.settings),
  upgradeable: cairoCommonSchema.upgradeable,
  appName: z.string().optional().describe(cairoCommonDescriptions.appName),
  appVersion: z.string().optional().describe(cairoCommonDescriptions.appVersion),
  info: cairoCommonSchema.info,
  macros: cairoCommonSchema.macros,
} as const satisfies z.ZodRawShape;

export const cairoVestingSchema = {
  name: z.string().describe(commonDescriptions.name),
  startDate: z.string().describe(cairoVestingDescriptions.startDate),
  duration: z.string().describe(cairoVestingDescriptions.duration),
  cliffDuration: z.string().describe(cairoVestingDescriptions.cliffDuration),
  schedule: z.enum(['linear', 'custom']).describe(cairoVestingDescriptions.schedule),
  info: cairoCommonSchema.info,
  macros: cairoCommonSchema.macros,
} as const satisfies z.ZodRawShape;

export const cairoCustomSchema = {
  name: z.string().describe(commonDescriptions.name),
  pausable: z.boolean().optional().describe(commonDescriptions.pausable),
  ...cairoCommonSchema,
} as const satisfies z.ZodRawShape;
