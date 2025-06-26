// IMPORTANT: This file must not have any imports since it is used in both Node and Deno environments,
// which have different requirements for file extensions in import statements.

export const stellarPrompts = {
  Fungible: 'Make a fungible token per the Fungible Token Standard, compatible with SEP-41, similar to ERC-20.',
  NonFungible:
    'Make a non-fungible token per the Non-Fungible Token Standard, compatible with SEP-50, similar to ERC-721.',
};

export const stellarCommonDescriptions = {
  upgradeable: 'Whether the contract can be upgraded.',
};

export const stellarFungibleDescriptions = {
  premint: 'The number of tokens to premint for the deployer.',
};

export const stellarNonFungibleDescriptions = {
  enumerable: 'Whether the NFTs are enumerable (can be iterated over).',
  consecutive: 'To batch mint NFTs instead of minting them individually (sequential minting is mandatory).',
  sequential: 'Whether the IDs of the minted NFTs will be sequential.',
};
