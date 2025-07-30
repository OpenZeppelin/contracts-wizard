// IMPORTANT: This file must not have any imports since it is used in both Node and Deno environments,
// which have different requirements for file extensions in import statements.

export const solidityPrompts = {
  ERC20: 'Make a fungible token per the ERC-20 standard.',
  ERC721: 'Make a non-fungible token per the ERC-721 standard.',
  ERC1155: 'Make a non-fungible token per the ERC-1155 standard.',
  Stablecoin:
    'Make a stablecoin token that uses the ERC-20 standard. Experimental, some features are not audited and are subject to change.',
  RWA: 'Make a real-world asset token that uses the ERC-20 standard. Experimental, some features are not audited and are subject to change.',
  Account:
    'Make an account contract that follows the ERC-4337 standard. Experimental, some features are not audited and are subject to change.',
  Governor: 'Make a contract to implement governance, such as for a DAO.',
  Custom: 'Make a custom smart contract.',
};

export const solidityCommonDescriptions = {
  access:
    'The type of access control to provision. Ownable is a simple mechanism with a single account authorized for all privileged actions. Roles is a flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts. Managed enables a central contract to define a policy that allows certain callers to access certain functions.',
  upgradeable:
    'Whether the smart contract is upgradeable. Transparent uses more complex proxy with higher overhead, requires less changes in your contract. Can also be used with beacons. UUPS uses simpler proxy with less overhead, requires including extra code in your contract. Allows flexibility for authorizing upgrades.',
};

export const solidityERC20Descriptions = {
  premint: 'The number of tokens to premint for the deployer.',
  permit:
    'Whether without paying gas, token holders will be able to allow third parties to transfer from their account.',
  votes:
    'Whether to keep track of historical balances for voting in on-chain governance. Voting durations can be expressed as block numbers or timestamps.',
  flashmint:
    "Whether to include built-in flash loans to allow lending tokens without requiring collateral as long as they're returned in the same transaction.",
  crossChainBridging:
    'Whether to allow authorized bridge contracts to mint and burn tokens for cross-chain transfers. Options are to use custom bridges on any chain, or the SuperchainERC20 standard with the predeployed SuperchainTokenBridge. Emphasize that these features are experimental, not audited and are subject to change. The SuperchainERC20 feature is only available on chains in the Superchain, and requires deploying your contract to the same address on every chain in the Superchain.',
  premintChainId: 'The chain ID of the network on which to premint tokens.',
  callback:
    'Whether to include support for code execution after transfers and approvals on recipient contracts in a single transaction.',
};

export const solidityERC721Descriptions = {
  baseUri: 'A base uri for the token',
  enumerable:
    'Whether to allow on-chain enumeration of all tokens or those owned by an account. Increases gas cost of transfers.',
  uriStorage: 'Allows updating token URIs for individual token IDs',
  incremental: 'Whether new tokens will be automatically assigned an incremental id',
  votes:
    'Whether to keep track of individual units for voting in on-chain governance. Voting durations can be expressed as block numbers or timestamps (defaulting to block number if not specified).',
};

export const solidityERC1155Descriptions = {
  uri: 'The location of the metadata for the token. Clients will replace any instance of {id} in this string with the tokenId.',
  supply: 'Whether to keep track of total supply of tokens',
  updatableUri: 'Whether privileged accounts will be able to set a new URI for all token types',
};

export const solidityStablecoinDescriptions = {
  custodian:
    'Whether authorized accounts can freeze and unfreeze accounts for regulatory or security purposes. This feature is experimental, not audited and is subject to change.',
  limitations:
    'Whether to restrict certain users from transferring tokens, either via allowing or blocking them. This feature is experimental, not audited and is subject to change.',
};

export const solidityAccountDescriptions = {
  signatureValidation:
    'Whether to implement the ERC-1271 standard for validating signatures. This is useful for the account to verify signatures.',
  ERC721Holder: 'Whether to implement the `onERC721Received` function to allow the account to receive ERC721 tokens.',
  ERC1155Holder:
    'Whether to implement the `onERC1155Received` function to allow the account to receive ERC1155 tokens.',
  signer: `Defines the signature verification algorithm used by the account to verify user operations. Options:
        - ECDSA: Standard Ethereum signature validation using secp256k1, validates signatures against a specified owner address
        - ERC7702: Special ECDSA validation using account's own address as signer, enables EOAs to delegate execution rights
        - P256: NIST P-256 curve (secp256r1) validation for integration with Passkeys and HSMs
        - RSA: RSA PKCS#1 v1.5 signature validation (RFC8017) for PKI systems and HSMs
        - Multisig: ERC-7913 multisignature requiring minimum number of signatures from authorized signers
        - MultisigWeighted: ERC-7913 weighted multisignature where signers have different voting weights`,
  batchedExecution:
    'Whether to implement a minimal batching interface for the account to allow multiple operations to be executed in a single transaction following the ERC-7821 standard.',
  ERC7579Modules:
    'Whether to implement the ERC-7579 compatibility to enable functionality on the account with modules.',
};

export const solidityGovernorDescriptions = {
  delay: 'The delay since proposal is created until voting starts, default is "1 day"',
  period: 'The length of period during which people can cast their vote, default is "1 week"',
  blockTime: 'The block time of the chain, default is 12',
  proposalThreshold: 'Minimum number of votes an account must have to create a proposal, default is 0.',
  decimals:
    'The number of decimals to use for the contract, default is 18 for ERC20Votes and 0 for ERC721Votes (because it does not apply to ERC721Votes)',
  quorumMode: 'The type of quorum mode to use',
  quorumPercent: 'The percent required, in cases of quorumMode equals percent',
  quorumAbsolute: 'The absolute quorum required, in cases of quorumMode equals absolute',
  votes: 'The type of voting to use',
  clockMode:
    'The clock mode used by the voting token. For Governor, this must be chosen to match what the ERC20 or ERC721 voting token uses.',
  timelock: 'The type of timelock to use',
  storage: 'Enable storage of proposal details and enumerability of proposals',
  settings: 'Allow governance to update voting settings (delay, period, proposal threshold)',
};

export const solidityCustomDescriptions = {
  crossChainMessaging:
    'Whether to add an example for Superchain interop message passing. Options are "superchain" or false',
  crossChainFunctionName:
    'The name of a custom function that will be callable from another chain, default is "myFunction". Only used if crossChainMessaging is set to "superchain"',
};
