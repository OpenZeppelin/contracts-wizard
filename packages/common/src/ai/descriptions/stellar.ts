// IMPORTANT: This file must not have any imports since it is used in both Node and Deno environments,
// which have different requirements for file extensions in import statements.

export const stellarPrompts = {
  Fungible: 'Make a fungible token per the Fungible Token Standard, compatible with SEP-41, similar to ERC-20.',
  Governor: 'Make a governor contract for on-chain governance using token-based voting.',
  NonFungible:
    'Make a non-fungible token per the Non-Fungible Token Standard, compatible with SEP-50, similar to ERC-721.',
  Stablecoin: 'Make a stablecoin that uses Fungible Token Standard, compatible with SEP-41.',
  Vault: 'Make a tokenized vault that issues Fungible Token shares for an underlying asset, similar to ERC-4626.',
};

export const stellarCommonDescriptions = {
  upgradeable: 'Whether the contract can be upgraded.',
  access:
    'The type of access control to provision. Ownable is a simple mechanism with a single account authorized for all privileged actions. Roles is a flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.',
  explicitImplementations:
    'Whether the contract should use explicit trait implementations instead of using the default ones provided by the library.',
};

export const stellarFungibleDescriptions = {
  decimals: 'The number of decimals used to represent token amounts. Defaults to 7.',
  premint: 'The number of tokens to premint for the deployer.',
  votes: 'Whether to enable vote checkpoints and delegation for governance.',
};

export const stellarNonFungibleDescriptions = {
  enumerable: 'Whether the NFTs are enumerable (can be iterated over).',
  consecutive: 'To batch mint NFTs instead of minting them individually (sequential minting is mandatory).',
  sequential: 'Whether the IDs of the minted NFTs will be sequential.',
  tokenUri: 'The metadata URI returned by the token contract for every NFT.',
  votes: 'Whether to enable vote checkpoints and delegation for governance.',
};

export const stellarStablecoinDescriptions = {
  limitations: 'Whether to restrict certain users from transferring tokens, either via allowing or blocking them.',
  decimals: 'The number of decimals used to represent token amounts. Defaults to 7.',
  premint: 'The number of tokens to premint for the deployer.',
  votes: 'Whether to enable vote checkpoints and delegation for governance.',
};

export const stellarVaultDescriptions = {
  decimalsOffset:
    'Virtual decimals offset added to the underlying asset decimals to derive the vault share decimals, used to mitigate inflation (donation) attacks via virtual shares. The default of 0 is already safe: it makes such attacks non-profitable. Higher values make attacks orders of magnitude more costly, at the cost of virtual shares absorbing a tiny portion of the value accrued to the vault. Must be between 0 and 10.',
};

export const stellarGovernorDescriptions = {
  version: 'The semantic version label returned by the governor contract.',
  votingDelay: 'Number of ledgers between proposal creation and voting start (17,000 ledgers are approx. 1 day).',
  votingPeriod: 'Number of ledgers during which voting remains open (120,000 ledgers are approx. 1 week).',
  proposalThreshold: 'Minimum voting power required for creating a proposal, default is 100.',
  quorum: 'Minimum number of votes required for a proposal to pass, default is 500.',
  timelock: 'Whether to add a timelock mechanism that enforces a delay between proposal queuing and execution.',
};
