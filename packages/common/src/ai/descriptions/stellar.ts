// IMPORTANT: This file must not have any imports since it is used in both Node and Deno environments,
// which have different requirements for file extensions in import statements.

export const stellarPrompts = {
  Fungible: 'Make a fungible token per the Fungible Token Standard, compatible with SEP-41, similar to ERC-20.',
  NonFungible:
    'Make a non-fungible token per the Non-Fungible Token Standard, compatible with SEP-50, similar to ERC-721.',
  Stablecoin: 'Make a stablecoin that uses Fungible Token Standard, compatible with SEP-41.',
};

export const stellarCommonDescriptions = {
  upgradeable: 'Whether the contract can be upgraded.',
  access:
    'The type of access control to provision. Ownable is a simple mechanism with a single account authorized for all privileged actions. Roles is a flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts.',
};

export const stellarFungibleDescriptions = {
  premint: 'The number of tokens to premint for the deployer.',
};

export const stellarNonFungibleDescriptions = {
  baseUri: 'A base uri for the token',
  enumerable: 'Whether the NFTs are enumerable (can be iterated over).',
  consecutive: 'To batch mint NFTs instead of minting them individually (sequential minting is mandatory).',
  sequential: 'Whether the IDs of the minted NFTs will be sequential.',
};

export const stellarStablecoinDescriptions = {
  limitations: 'Whether to restrict certain users from transferring tokens, either via allowing or blocking them.',
  premint: 'The number of tokens to premint for the deployer.',
};
