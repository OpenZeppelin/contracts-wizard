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
  premint: z.string().optional().describe('The number of tokens to premint for the deployer.'),
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
  baseUri: z.string().optional().describe('A base uri for the non-fungible token.'),
  burnable: z.boolean().optional().describe('Whether token holders will be able to destroy their tokens'),
  pausable: z.boolean().optional().describe('Whether privileged accounts will be able to pause specifically marked functionality. Useful for emergency response.'),
  mintable: z.boolean().optional().describe('Whether privileged accounts will be able to create more supply or emit more tokens'),
  enumerable: z.boolean().optional().describe('Whether to allow on-chain enumeration of all tokens or those owned by an account. Increases gas cost of transfers.'),
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
  baseUri: z.string().describe('The Location of the metadata for the token. Clients will replace any instance of {id} in this string with the tokenId.'),
  burnable: z.boolean().optional().describe('Whether token holders will be able to destroy their tokens'),
  pausable: z.boolean().optional().describe('Whether privileged accounts will be able to pause specifically marked functionality. Useful for emergency response.'),
  mintable: z.boolean().optional().describe('Whether privileged accounts will be able to create more supply or emit more tokens'),
  updatableUri: z.boolean().optional().describe('Whether privileged accounts will be able to set a new URI for all token types.'),
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
  type: z.enum(['stark', 'eth']).describe('Type of signature used for signature checking by the Account contract, Starknet account uses the STARK curve, Ethereum-flavored account uses the Secp256k1 curve.'),
  declare: z.boolean().optional().describe('Whether to enable the account to declare other contract classes.'),
  deploy: z.boolean().optional().describe('Whether to enables the account to be counterfactually deployed.'),
  pubkey: z.boolean().optional().describe('Whether to enables the account to change its own public key.'),
  outsideExecution: z.boolean().optional().describe('Whether to allow a protocol to submit transactions on behalf of the account, as long as it has the relevant signatures.'),
  upgradeable: commonSchema.upgradeable,
  info: commonSchema.info,
};

export const multisigSchema = {
  name: z.string().describe('The name of the contract'),
  quorum: z.string().describe('The minimal number of confirmations required by the Multisig to approve a transaction.'),
  upgradeable: commonSchema.upgradeable,
  info: commonSchema.info,
};

export const governorSchema = {
  name: z.string().describe('The name of the contract'),
  delay: z.string().describe('The delay since proposal is created until voting starts, in readable date time format matching /^(\\d+(?:\\.\\d+)?) +(second|minute|hour|day|week|month|year)s?$/, default is "1 day".'),
  period: z.string().describe('The length of period during which people can cast their vote, in readable date time format matching /^(\\d+(?:\\.\\d+)?) +(second|minute|hour|day|week|month|year)s?$/, default is "1 week".'),
  votes: z.enum(['erc20votes', 'erc721votes']).optional().describe('The type of voting to use. Either erc20votes, meaning voting power with a votes-enabled ERC20 token. Either erc721votes, meaning voting power with a votes-enabled ERC721 token. Voters can entrust their voting power to a delegate.'),
  clockMode: z.enum(['timestamp']).optional().describe('The clock mode used by the voting token. For now, only timestamp mode where the token uses voting durations expressed as timestamps is supported. For Governor, this must be chosen to match what the ERC20 or ERC721 voting token uses.'),
  timelock: z.union([z.literal(false), z.literal('openzeppelin')]).optional().describe('Whether to add a delay to actions taken by the Governor. Gives users time to exit the system if they disagree with governance decisions. If "openzeplin", Module compatible with OpenZeppelin\'s TimelockController.'),
  decimals: z.number().optional().describe('The number of decimals to use for the contract, unless otherwise specified default is 18 for ERC20Votes and 0 for ERC721Votes (because it does not apply to ERC721Votes).'),
  proposalThreshold: z.string().optional().describe('Minimum number of votes an account must have to create a proposal, default is 0.'),
  quorumMode: z.enum(['percent', 'absolute']).optional().describe('The type of quorum mode to use, either by percentage or absolute value.'),
  quorumPercent: z.number().optional().describe('The percent required, in cases of quorumMode equals percent.'),
  quorumAbsolute: z.string().optional().describe('The absolute quorum required, in cases of quorumMode equals absolute.'),
  settings: z.boolean().optional().describe('Whether to allow governance to update voting settings (delay, period, proposal threshold).'),
  upgradeable: commonSchema.upgradeable,
  appName: z.string().optional().describe('The name of the application. Default is "OpenZeppelin Governor"'),
  appVersion: z.string().optional().describe('The version of the application. Default is "v1"'),
  info: commonSchema.info,
};

export const vestingSchema = {
  name: z.string().describe('The name of the contract'),
  startDate: z.string().describe('The timestamp marking the beginning of the vesting period. In HTML input datetime-local format, for example `2024-12-31T23:59`'),
  duration: z.string().describe('The total duration of the vesting period. In readable date time format matching /^(\\d+(?:\\.\\d+)?) +(second|minute|hour|day|week|month|year)s?$/'),
  cliffDuration: z.string().describe('The duration of the cliff period. Must be less than or equal to the total duration. In readable date time format matching /^(\\d+(?:\\.\\d+)?) +(second|minute|hour|day|week|month|year)s?$/'),
  schedule: z.enum(['linear', 'custom']).describe('A vesting schedule implementation, tokens can either be vested gradually following a linear curve or with custom vesting schedule that requires the implementation of the VestingSchedule trait.'),
  info: commonSchema.info,
};

export const customSchema = {
  name: z.string().describe('The name of the custom contract.'),
  pausable: z.boolean().optional().describe('Whether privileged accounts will be able to pause specifically marked functionality. Useful for emergency response.'),
  ...commonSchema,
}