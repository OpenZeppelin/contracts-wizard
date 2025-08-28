// IMPORTANT: This file must not have any imports since it is used in both Node and Deno environments,
// which have different requirements for file extensions in import statements.

export const zamaPrompts = {
  ConfidentialFungible: 'Make a confidential fungible token per the ERC-7984 standard, similar to ERC-20 but with confidentiality.',
};

export const zamaConfidentialFungibleDescriptions = {
  tokenURI: 'The URI of the token.',
  premint: 'The number of tokens to premint for the deployer.',
  networkConfig: 'Specify the network on which to use FHEVM contracts provided by Zama.',
  wrappable: 'Whether to allow wrapping an ERC20 token into a confidential fungible token.',
  votes:
    'Whether to keep track of historical balances for voting in on-chain governance. Voting durations can be expressed as block numbers or timestamps.',
};
