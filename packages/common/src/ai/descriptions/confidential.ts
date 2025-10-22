// IMPORTANT: This file must not have any imports since it is used in both Node and Deno environments,
// which have different requirements for file extensions in import statements.

export const confidentialPrompts = {
  ConfidentialFungible:
    'Make a confidential fungible token in Solidity according to the ERC-7984 standard, similar to ERC-20 but with confidentiality.',
};

export const confidentialConfidentialFungibleDescriptions = {
  tokenURI: 'A URI related to the token.',
  premint: 'The number of tokens to premint for the deployer.',
  networkConfig: 'Specify the provider and network configuration to use for FHEVM contracts.',
  wrappable: 'Whether to allow wrapping an ERC20 token into a confidential fungible token.',
  votes:
    'Whether to keep track of historical balances for voting in on-chain governance. Voting durations must be expressed as block numbers or timestamps.',
};
