import { z } from 'zod';

export const commonSchema = {
  access: z
    .literal('ownable')
    .or(z.literal('roles'))
    .or(z.literal('managed'))
    .optional()
    .describe(
      'The type of access control to provision. Ownable is a simple mechanism with a single account authorized for all privileged actions. Roles is a flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts. Managed enables a central contract to define a policy that allows certain callers to access certain functions.'
    ),
  upgradeable: z
    .literal('transparent')
    .or(z.literal('uups'))
    .optional()
    .describe(
      'Whether the smart contract is upgradeable. Transparent uses more complex proxy with higher overhead, requires less changes in your contract. Can also be used with beacons. UUPS uses simpler proxy with less overhead, requires including extra code in your contract. Allows flexibility for authorizing upgrades.'
    ),
  info: z
    .object({
      securityContact: z
        .string()
        .optional()
        .describe(
          'Email where people can contact you to report security issues. Will only be visible if contract source code is verified.'
        ),
      license: z.string().optional().describe('The license used by the contract, default is "MIT"'),
    })
    .optional()
    .describe('Metadata about the contract and author'),
};

export const erc20Schema = {
  name: z.string().describe('The name of the contract'),
  symbol: z.string().describe('The short symbol for the token'),
  burnable: z.boolean().optional().describe('Whether token holders will be able to destroy their tokens'),
  pausable: z.boolean().optional().describe('Whether privileged accounts will be able to pause specifically marked functionality. Useful for emergency response.'),
  premint: z.string().optional().describe('The number of tokens to premint for the deployer'),
  premintChainId: z.string().optional().describe('The chain ID of the network on which to premint tokens'),
  mintable: z.boolean().optional().describe('Whether privileged accounts will be able to create more supply or emit more tokens'),
  callback: z.boolean().optional().describe('Whether to include support for code execution after transfers and approvals on recipient contracts in a single transaction'),
  permit: z.boolean().optional().describe('Whether without paying gas, token holders will be able to allow third parties to transfer from their account.'),
  votes: z
    .literal('blocknumber')
    .or(z.literal('timestamp'))
    .optional()
    .describe('Whether to keep track of historical balances for voting in on-chain governance. Voting durations can be expressed as block numbers or timestamps'),
  flashmint: z.boolean().optional().describe('Whether to include built-in flash loans to allow lending tokens without requiring collateral as long as they\'re returned in the same transaction'),
  crossChainBridging: z
    .literal('custom')
    .or(z.literal('superchain'))
    .optional()
    .describe('Whether to allow authorized bridge contracts to mint and burn tokens for cross-chain transfers. Options are to use custom bridges on any chain, or the SuperchainERC20 standard with the predeployed SuperchainTokenBridge. Emphasize that these features are experimental, not audited and are subject to change. The SuperchainERC20 feature is only available on chains in the Superchain, and requires deploying your contract to the same address on every chain in the Superchain.'),
  ...commonSchema,
};

export const erc721Schema = {
  name: z.string().describe('The name of the contract'),
  symbol: z.string().describe('The short symbol for the token'),
  baseUri: z.string().optional().describe('The base URI for all token metadata'),
  enumerable: z.boolean().optional().describe('Whether to allow on-chain enumeration of all tokens or those owned by an account. Increases gas cost of transfers'),
  uriStorage: z.boolean().optional().describe('Whether to include functionality to update token URIs for individual token IDs'),
  burnable: z.boolean().optional().describe('Whether token holders will be able to destroy their tokens'),
  pausable: z.boolean().optional().describe('Whether privileged accounts will be able to pause specifically marked functionality. Useful for emergency response.'),
  mintable: z.boolean().optional().describe('Whether privileged accounts will be able to create more supply or emit more tokens'),
  incremental: z.boolean().optional().describe('Whether new tokens will be automatically assigned an incremental id'),
  votes: z
    .literal('blocknumber')
    .or(z.literal('timestamp'))
    .optional()
    .describe('Whether to keep track of individual units for voting in on-chain governance. Voting durations can be expressed as block numbers or timestamps (defaulting to block number if not specified)'),
  ...commonSchema,
};

export const erc1155Schema = {
  name: z.string().describe('The name of the contract'),
  uri: z.string().describe('The location of the metadata for the token. Clients will replace any instance of {id} in this string with the tokenId.'),
  burnable: z.boolean().optional().describe('Whether token holders will be able to destroy their tokens'),
  pausable: z.boolean().optional().describe('Whether privileged accounts will be able to pause specifically marked functionality. Useful for emergency response.'),
  mintable: z.boolean().optional().describe('Whether privileged accounts will be able to create more supply or emit more tokens'),
  supply: z.boolean().optional().describe('Whether to keep track of total supply of tokens'),
  updatableUri: z.boolean().optional().describe('Whether privileged accounts will be able to set a new URI for all token types'),
  ...commonSchema,
};

export const stablecoinSchema = {
  ...erc20Schema,
  limitations: z
    .literal(false)
    .or(z.literal('allowlist'))
    .or(z.literal('blocklist'))
    .optional()
    .describe('Whether to restrict certain users from transferring tokens, either via allowing or blocking them. This feature is experimental, not audited and is subject to change.'),
  custodian: z
    .boolean()
    .optional()
    .describe('Whether authorized accounts can freeze and unfreeze accounts for regulatory or security purposes. This feature is experimental, not audited and is subject to change.'),
};

export const rwaSchema = stablecoinSchema;

export const accountSchema = {
  name: z.string().describe('The name of the account contract'),
  signatureValidation: z
    .literal(false)
    .or(z.literal('ERC1271'))
    .or(z.literal('ERC7739'))
    .optional()
    .describe('Whether to implement the ERC-1271 or ERC-7739 standard for validating signatures. This is useful for the account to verify signatures.'),
  ERC721Holder: z
    .boolean()
    .optional()
    .describe('Whether to implement the `onERC721Received` function to allow the account to receive ERC721 tokens.'),
  ERC1155Holder: z
    .boolean()
    .optional()
    .describe('Whether to implement the `onERC1155Received` function to allow the account to receive ERC1155 tokens.'),
  signer: z
    .literal(false)
    .or(z.literal('ERC7702'))
    .or(z.literal('ECDSA'))
    .or(z.literal('P256'))
    .or(z.literal('RSA'))
    .or(z.literal('Multisig'))
    .or(z.literal('MultisigWeighted'))
    .optional()
    .describe(`Defines the signature verification algorithm used by the account to verify user operations. Options:
    - ECDSA: Standard Ethereum signature validation using secp256k1, validates signatures against a specified owner address
    - ERC7702: Special ECDSA validation using account's own address as signer, enables EOAs to delegate execution rights
    - P256: NIST P-256 curve (secp256r1) validation for integration with Passkeys and HSMs
    - RSA: RSA PKCS#1 v1.5 signature validation (RFC8017) for PKI systems and HSMs
    - Multisig: ERC-7913 multisignature requiring minimum number of signatures from authorized signers
    - MultisigWeighted: ERC-7913 weighted multisignature where signers have different voting weights`),
  batchedExecution: z
    .boolean()
    .optional()
    .describe('Whether to implement a minimal batching interface for the account to allow multiple operations to be executed in a single transaction following the ERC-7821 standard.'),
  ERC7579Modules: z
    .literal(false)
    .or(z.literal('AccountERC7579'))
    .or(z.literal('AccountERC7579Hooked'))
    .optional()
    .describe('Whether to implement the ERC-7579 compatibility to enable functionality on the account with modules.'),
  info: commonSchema.info,
}

export const governorSchema = {
  name: z.string().describe('The name of the governor contract'),
  delay: z.string().describe('The delay since proposal is created until voting starts, default is "1 day"'),
  period: z.string().describe('The length of period during which people can cast their vote, default is "1 week"'),
  votes: z
    .literal('erc20votes')
    .or(z.literal('erc721votes'))
    .optional()
    .describe('The type of voting token to use (ERC20Votes or ERC721Votes)'),
  clockMode: z
    .literal('blocknumber')
    .or(z.literal('timestamp'))
    .optional()
    .describe('The clock mode used by the voting token. For Governor, this must match what the ERC20 or ERC721 voting token uses.'),
  timelock: z
    .literal(false)
    .or(z.literal('openzeppelin'))
    .or(z.literal('compound'))
    .optional()
    .describe('The type of timelock to use for executing proposals'),
  blockTime: z
    .number()
    .optional()
    .describe('The number of seconds assumed for a block, default is 12'),
  decimals: z
    .number()
    .optional()
    .describe('The number of decimals to use for the contract, default is 18 for ERC20Votes and 0 for ERC721Votes'),
  proposalThreshold: z
    .string()
    .optional()
    .describe('Minimum number of votes an account must have to create a proposal, default is 0'),
  quorumMode: z
    .literal('percent')
    .or(z.literal('absolute'))
    .optional()
    .describe('The type of quorum mode to use (percentage or absolute number)'),
  quorumPercent: z
    .number()
    .optional()
    .describe('The percentage of votes required for a proposal to pass, used when quorumMode is "percent"'),
  quorumAbsolute: z
    .string()
    .optional()
    .describe('The absolute number of votes required for a proposal to pass, used when quorumMode is "absolute"'),
  storage: z
    .boolean()
    .optional()
    .describe('Whether to enable storage of proposal details and enumerability of proposals'),
  settings: z
    .boolean()
    .optional()
    .describe('Whether to allow governance to update voting settings (delay, period, proposal threshold)'),
  ...commonSchema,
}

export const customSchema = {
  name: z.string().describe('The name of the custom contract'),
  ...commonSchema,
}