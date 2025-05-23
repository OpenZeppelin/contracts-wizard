import { z } from 'zod';

export const commonSchema = {
  access: z.literal('ownable').or(z.literal('roles')).or(z.literal('managed')).optional(),
  upgradeable: z.literal('transparent').or(z.literal('uups')).optional(),
  info: z
    .object({
      securityContact: z.string().optional(),
      license: z.string().optional(),
    })
    .optional(),
};

export const erc20Schema = {
  name: z.string(),
  symbol: z.string(),
  burnable: z.boolean().optional(),
  pausable: z.boolean().optional(),
  premint: z.string().optional(),
  premintChainId: z.string().optional(),
  mintable: z.boolean().optional(),
  callback: z.boolean().optional(),
  permit: z.boolean().optional(),
  votes: z.literal('blocknumber').or(z.literal('timestamp')).optional(),
  flashmint: z.boolean().optional(),
  crossChainBridging: z.literal('custom').or(z.literal('superchain')).optional(),
  ...commonSchema,
};

export const erc721Schema = {
  name: z.string(),
  symbol: z.string(),
  baseUri: z.string().optional(),
  enumerable: z.boolean().optional(),
  uriStorage: z.boolean().optional(),
  burnable: z.boolean().optional(),
  pausable: z.boolean().optional(),
  mintable: z.boolean().optional(),
  incremental: z.boolean().optional(),
  votes: z.literal('blocknumber').or(z.literal('timestamp')).optional(),
  ...commonSchema,
};

export const erc1155Schema = {
  name: z.string(),
  uri: z.string(),
  burnable: z.boolean().optional(),
  pausable: z.boolean().optional(),
  mintable: z.boolean().optional(),
  supply: z.boolean().optional(),
  updatableUri: z.boolean().optional(),
  ...commonSchema,
};

export const stablecoinSchema = {
  ...erc20Schema,
  limitations: z.literal(false).or(z.literal('allowlist')).or(z.literal('blocklist')).optional(),
  custodian: z.boolean().optional(),
}

export const rwaSchema = stablecoinSchema;

export const accountSchema = {
  name: z.string(),
  signatureValidation: z.literal(false).or(z.literal('ERC1271')).or(z.literal('ERC7739')).optional(),
  ERC721Holder: z.boolean().optional(),
  ERC1155Holder: z.boolean().optional(),
  signer: z.literal(false).or(z.literal('ERC7702')).or(z.literal('ECDSA')).or(z.literal('P256')).or(z.literal('RSA')).or(z.literal('Multisig')).or(z.literal('MultisigWeighted')).optional(),
  batchedExecution: z.boolean().optional(),
  ERC7579Modules: z.literal(false).or(z.literal('AccountERC7579')).or(z.literal('AccountERC7579Hooked')).optional(),
  info: commonSchema.info,
}

export const governorSchema = {
  name: z.string(),
  delay: z.string(),
  period: z.string(),
  votes: z.literal('erc20votes').or(z.literal('erc721votes')).optional(),
  clockMode: z.literal('blocknumber').or(z.literal('timestamp')).optional(),
  timelock: z.literal(false).or(z.literal('openzeppelin')).or(z.literal('compound')).optional(),
  blockTime: z.number().optional(),
  decimals: z.number().optional(),
  proposalThreshold: z.string().optional(),
  quorumMode: z.literal('percent').or(z.literal('absolute')).optional(),
  quorumPercent: z.number().optional(),
  quorumAbsolute: z.string().optional(),
  storage: z.boolean().optional(),
  settings: z.boolean().optional(),
  ...commonSchema,
}

export const customSchema = {
  name: z.string(),
  ...commonSchema,
}