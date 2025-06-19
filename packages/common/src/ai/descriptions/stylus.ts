// IMPORTANT: This file must not have any imports since it is used in both Node and Deno environments,
// which have different requirements for file extensions in import statements.

export const stylusPrompts = {
  ERC20: 'Make a fungible token per the ERC-20 standard.',
  ERC721: 'Make a non-fungible token per the ERC-721 standard.',
  ERC1155: 'Make a non-fungible token per the ERC-1155 standard.',
};

export const stylusERC20Descriptions = {
  permit:
    'Whether without paying gas, token holders will be able to allow third parties to transfer from their account.',
  flashmint:
    "Whether to include built-in flash loans to allow lending tokens without requiring collateral as long as they're returned in the same transaction.",
};

export const stylusERC721Descriptions = {
  enumerable:
    'Whether to allow on-chain enumeration of all tokens or those owned by an account. Increases gas cost of transfers.',
};

export const stylusERC1155Descriptions = {
  supply: 'Whether to keep track of total supply of tokens',
};
