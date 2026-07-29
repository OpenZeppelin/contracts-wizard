import { z } from 'zod';
import {
  commonDescriptions,
  infoDescriptions,
  solidityCommonDescriptions,
  solidityERC20Descriptions,
  solidityERC721Descriptions,
  solidityERC1155Descriptions,
  solidityGovernorDescriptions,
  solidityAccountDescriptions,
  solidityStablecoinDescriptions,
} from '../../index';

export const solidityCommonSchema = {
  access: z
    .literal('ownable')
    .or(z.literal('roles'))
    .or(z.literal('managed'))
    .optional()
    .describe(solidityCommonDescriptions.access),
  upgradeable: z
    .literal('transparent')
    .or(z.literal('uups'))
    .optional()
    .describe(solidityCommonDescriptions.upgradeable),
  info: z
    .object({
      securityContact: z.string().optional().describe(infoDescriptions.securityContact),
      license: z.string().optional().describe(infoDescriptions.license),
    })
    .optional()
    .describe(infoDescriptions.info),
} as const satisfies z.ZodRawShape;

export const solidityERC20Schema = {
  name: z.string().describe(commonDescriptions.name),
  symbol: z.string().describe(commonDescriptions.symbol),
  decimals: z.string().optional().describe(solidityERC20Descriptions.decimals),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  pausable: z.boolean().optional().describe(commonDescriptions.pausable),
  premint: z.string().optional().describe(solidityERC20Descriptions.premint),
  premintChainId: z.string().optional().describe(solidityERC20Descriptions.premintChainId),
  mintable: z.boolean().optional().describe(commonDescriptions.mintable),
  callback: z.boolean().optional().describe(solidityERC20Descriptions.callback),
  permit: z.boolean().optional().describe(solidityERC20Descriptions.permit),
  votes: z.literal('blocknumber').or(z.literal('timestamp')).optional().describe(solidityERC20Descriptions.votes),
  flashmint: z.boolean().optional().describe(solidityERC20Descriptions.flashmint),
  crossChainBridging: z
    .literal('custom')
    .or(z.literal('erc7786native'))
    .or(z.literal('superchain'))
    .optional()
    .describe(solidityERC20Descriptions.crossChainBridging),
  crossChainLinkAllowOverride: z.boolean().optional().describe(solidityERC20Descriptions.crossChainLinkAllowOverride),
  namespacePrefix: z.string().optional().describe(solidityCommonDescriptions.namespacePrefix),
  ...solidityCommonSchema,
} as const satisfies z.ZodRawShape;

export const solidityERC721Schema = {
  name: z.string().describe(commonDescriptions.name),
  symbol: z.string().describe(commonDescriptions.symbol),
  baseUri: z.string().optional().describe(solidityERC721Descriptions.baseUri),
  enumerable: z.boolean().optional().describe(solidityERC721Descriptions.enumerable),
  uriStorage: z.boolean().optional().describe(solidityERC721Descriptions.uriStorage),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  pausable: z.boolean().optional().describe(commonDescriptions.pausable),
  mintable: z.boolean().optional().describe(commonDescriptions.mintable),
  incremental: z.boolean().optional().describe(solidityERC721Descriptions.incremental),
  votes: z.literal('blocknumber').or(z.literal('timestamp')).optional().describe(solidityERC721Descriptions.votes),
  ...solidityCommonSchema,
  namespacePrefix: z.string().optional().describe(solidityCommonDescriptions.namespacePrefix),
} as const satisfies z.ZodRawShape;

export const solidityERC1155Schema = {
  name: z.string().describe(commonDescriptions.name),
  uri: z.string().describe(solidityERC1155Descriptions.uri),
  burnable: z.boolean().optional().describe(commonDescriptions.burnable),
  pausable: z.boolean().optional().describe(commonDescriptions.pausable),
  mintable: z.boolean().optional().describe(commonDescriptions.mintable),
  supply: z.boolean().optional().describe(solidityERC1155Descriptions.supply),
  updatableUri: z.boolean().optional().describe(solidityERC1155Descriptions.updatableUri),
  ...solidityCommonSchema,
} as const satisfies z.ZodRawShape;

const { upgradeable: _, ...solidityERC20SchemaOmitUpgradeable } = solidityERC20Schema;

export const solidityStablecoinSchema = {
  ...solidityERC20SchemaOmitUpgradeable,
  restrictions: z
    .literal(false)
    .or(z.literal('allowlist'))
    .or(z.literal('blocklist'))
    .optional()
    .describe(solidityStablecoinDescriptions.restrictions),
  freezable: z.boolean().optional().describe(solidityStablecoinDescriptions.freezable),
} as const satisfies z.ZodRawShape;

export const solidityRWASchema = solidityStablecoinSchema;

export const solidityAccountSchema = {
  name: z.string().describe('The name of the account contract'),
  signatureValidation: z
    .literal(false)
    .or(z.literal('ERC1271'))
    .or(z.literal('ERC7739'))
    .optional()
    .describe(solidityAccountDescriptions.signatureValidation),
  ERC721Holder: z.boolean().optional().describe(solidityAccountDescriptions.ERC721Holder),
  ERC1155Holder: z.boolean().optional().describe(solidityAccountDescriptions.ERC1155Holder),
  signer: z
    .literal(false)
    .or(z.literal('ECDSA'))
    .or(z.literal('EIP7702'))
    .or(z.literal('Multisig'))
    .or(z.literal('MultisigWeighted'))
    .or(z.literal('P256'))
    .or(z.literal('RSA'))
    .or(z.literal('WebAuthn'))
    .optional()
    .describe(solidityAccountDescriptions.signer),
  batchedExecution: z.boolean().optional().describe(solidityAccountDescriptions.batchedExecution),
  ERC7579Modules: z
    .literal(false)
    .or(z.literal('AccountERC7579'))
    .or(z.literal('AccountERC7579Hooked'))
    .optional()
    .describe(solidityAccountDescriptions.ERC7579Modules),
  info: solidityCommonSchema.info,
  upgradeable: solidityCommonSchema.upgradeable,
} as const satisfies z.ZodRawShape;

export const solidityGovernorSchema = {
  name: z.string().describe(commonDescriptions.name),
  delay: z.string().describe(solidityGovernorDescriptions.delay),
  period: z.string().describe(solidityGovernorDescriptions.period),
  votes: z.literal('erc20votes').or(z.literal('erc721votes')).optional().describe(solidityGovernorDescriptions.votes),
  clockMode: z
    .literal('blocknumber')
    .or(z.literal('timestamp'))
    .optional()
    .describe(solidityGovernorDescriptions.clockMode),
  timelock: z
    .literal(false)
    .or(z.literal('openzeppelin'))
    .or(z.literal('compound'))
    .optional()
    .describe(solidityGovernorDescriptions.timelock),
  blockTime: z.number().optional().describe(solidityGovernorDescriptions.blockTime),
  decimals: z.number().optional().describe(solidityGovernorDescriptions.decimals),
  proposalThreshold: z.string().optional().describe(solidityGovernorDescriptions.proposalThreshold),
  quorumMode: z
    .literal('percent')
    .or(z.literal('absolute'))
    .optional()
    .describe(solidityGovernorDescriptions.quorumMode),
  quorumPercent: z.number().optional().describe(solidityGovernorDescriptions.quorumPercent),
  quorumAbsolute: z.string().optional().describe(solidityGovernorDescriptions.quorumAbsolute),
  storage: z.boolean().optional().describe(solidityGovernorDescriptions.storage),
  settings: z.boolean().optional().describe(solidityGovernorDescriptions.settings),
  upgradeable: solidityCommonSchema.upgradeable,
  info: solidityCommonSchema.info,
} as const satisfies z.ZodRawShape;

export const solidityCustomSchema = {
  name: z.string().describe(commonDescriptions.name),
  pausable: z.boolean().optional().describe(commonDescriptions.pausable),
  ...solidityCommonSchema,
} as const satisfies z.ZodRawShape;
