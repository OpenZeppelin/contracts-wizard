import { z } from 'zod';

export const commonSchema = {
  access: z
    .literal('ownable')
    .or(z.literal('roles'))
    .optional()
    .describe(
      'The type of access control to provision. Ownable is a simple mechanism with a single account authorized for all privileged actions. Roles is a flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.'
    ),
  upgradeable: z
    .boolean()
    .optional()
    .describe(
      'Whether the smart contract is upgradeable.'
    ),
  info: z
    .object({
      license: z.string().optional().describe('The license used by the contract, default is "MIT"'),
    })
    .optional()
    .describe('Metadata about the contract'),
};

export const erc20Schema = {
  name: z.string().describe('The name of the contract'),
  symbol: z.string().describe('The short symbol for the token'),
  burnable: z.boolean().optional().describe('Whether token holders will be able to destroy their tokens'),
  pausable: z.boolean().optional().describe('Whether privileged accounts will be able to pause specifically marked functionality. Useful for emergency response.'),
  premint: z.string().optional().describe('The number of tokens to premint for the deployer'),
  mintable: z.boolean().optional().describe('Whether privileged accounts will be able to create more supply or emit more tokens'),
  votes: z
    .boolean()
    .optional()
    .describe('Whether to keep track of historical balances for voting in on-chain governance.'),
  appName: z.string().optional().describe('The name of the application, must be provided if votes are enabled'),
  appVersion: z.string().optional().describe('The version of the application, must be provided if votes are enabled. Default is v1'),
  ...commonSchema,
};

export const erc721Schema = {
  name: z.string().describe('The name of the contract'),
  symbol: z.string().describe('The short symbol for the token'),
  baseUri: z.string().optional().describe('The base URI for all token metadata'),
  burnable: z.boolean().optional().describe('Whether token holders will be able to destroy their tokens'),
  pausable: z.boolean().optional().describe('Whether privileged accounts will be able to pause specifically marked functionality. Useful for emergency response.'),
  mintable: z.boolean().optional().describe('Whether privileged accounts will be able to create more supply or emit more tokens'),
  enumerable: z.boolean().optional().describe('Whether to allow on-chain enumeration of all tokens or those owned by an account. Increases gas cost of transfers'),
  votes: z
    .boolean()
    .optional()
    .describe('Whether to keep track of historical balances for voting in on-chain governance.'),
  royaltyInfo: z
    .object({
      enabled: z.boolean().describe('Whether to enable royalty info'),
      defaultRoyaltyFraction: z.string().describe('The default royalty fraction'),
      feeDenominator: z.string().describe('The fee denominator'),
    })
    .optional()
    .describe('The royalty info options'),
  appName: z.string().optional().describe('The name of the application, must be provided if votes are enabled'),
  appVersion: z.string().optional().describe('The version of the application, must be provided if votes are enabled. Default is v1'),
  ...commonSchema,
};

export const erc1155Schema = {
  name: z.string().describe('The name of the contract'),
  baseUri: z.string().describe('The base URI for all token metadata'),
  burnable: z.boolean().optional().describe('Whether token holders will be able to destroy their tokens'),
  pausable: z.boolean().optional().describe('Whether privileged accounts will be able to pause specifically marked functionality. Useful for emergency response.'),
  mintable: z.boolean().optional().describe('Whether privileged accounts will be able to create more supply or emit more tokens'),
  updatableUri: z.boolean().optional().describe('Whether the base URI can be updated'),
  royaltyInfo: z
    .object({
      enabled: z.boolean().describe('Whether to enable royalty info'),
      defaultRoyaltyFraction: z.string().describe('The default royalty fraction'),
      feeDenominator: z.string().describe('The fee denominator'),
    })
    .optional()
    .describe('The royalty info options'),
  ...commonSchema,
};

export const accountSchema = {
  name: z.string().describe('The name of the contract'),
  type: z.enum(['stark', 'eth']).describe('The type of account'),
  declare: z.boolean().optional().describe('Whether to declare the contract'),
  deploy: z.boolean().optional().describe('Whether to deploy the contract'),
  pubkey: z.boolean().optional().describe('Whether to include the public key'),
  outsideExecution: z.boolean().optional().describe('Whether to include outside execution'),
  upgradeable: commonSchema.upgradeable,
  info: commonSchema.info,
};

export const multisigSchema = {
  name: z.string().describe('The name of the contract'),
  quorum: z.string().describe('The quorum of the multisig'),
  upgradeable: commonSchema.upgradeable,
  info: commonSchema.info,
};

export const governorSchema = {
  name: z.string().describe('The name of the contract'),
  delay: z.string().describe('The delay between proposal and execution'),
  period: z.string().describe('The period between proposal and execution'),
  votes: z.enum(['erc20votes', 'erc721votes']).optional().describe('The votes to use for governance'),
  clockMode: z.enum(['timestamp']).optional().describe('The clock mode to use for governance'),
  timelock: z.enum(['openzeppelin']).optional().describe('The timelock to use for governance'), // TODO handle false
  decimals: z.number().optional().describe('The decimals to use for governance'),
  proposalThreshold: z.string().optional().describe('The proposal threshold to use for governance'),
  quorumMode: z.enum(['percent', 'absolute']).optional().describe('The quorum mode to use for governance'),
  quorumPercent: z.number().optional().describe('The quorum percent to use for governance'),
  quorumAbsolute: z.string().optional().describe('The quorum absolute to use for governance'),
  settings: z.boolean().optional().describe('Whether to enable settings for governance'),
  upgradeable: commonSchema.upgradeable,
  appName: z.string().optional().describe('The name of the application. Default is "OpenZeppelin Governor"'),
  appVersion: z.string().optional().describe('The version of the application. Default is "v1"'),
  info: commonSchema.info,
};

export const vestingSchema = {
  name: z.string().describe('The name of the contract'),
  startDate: z.string().describe('The timestamp marking the beginning of the vesting period. In HTML input datetime-local format, for example `2024-12-31T23:59`'),
  duration: z.string().describe('The duration of the vesting'),
  cliffDuration: z.string().describe('The cliff duration of the vesting'),
  schedule: z.enum(['linear', 'custom']).describe('The schedule of the vesting'),
  info: commonSchema.info,
};

export const customSchema = {
  name: z.string().describe('The name of the custom contract'),
  pausable: z.boolean().optional().describe('Whether privileged accounts will be able to pause specifically marked functionality. Useful for emergency response.'),
  ...commonSchema,
}