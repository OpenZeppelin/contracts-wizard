// IMPORTANT: This file must not have any imports since it is used in both Node and Deno environments,
// which have different requirements for file extensions in import statements.

export const midenPrompts = {
  Fungible:
    'Make a fungible token faucet account for Miden, composed of the standard account components of the Miden protocol, similar to ERC-20.',
  NonFungible:
    'Make a non-fungible token (NFT) faucet account for Miden, composed of the standard account components of the Miden protocol, similar to ERC-721.',
};

export const midenCommonDescriptions = {
  access:
    'How privileged operations of the faucet account are authorized. Without access control, the faucet is a user account authenticated by a single signature, and the key holder is the sole authority. Ownable creates a network account whose privileged procedures are gated by an owner account, with two-step ownership transfer. Roles creates a network account with role-based access control, where each privileged procedure can be assigned its own role.',
  burnable:
    'Whether any holder can burn the asset by sending it back to the faucet in a BURN note. Otherwise only the owner can burn, which requires access control.',
  pausable:
    'Whether privileged accounts will be able to pause minting, burning and transfers of the asset. Useful for emergency response.',
  restrictions:
    'Whether to restrict transfers of the asset through the send and receive policies of the faucet: an allowlist only lets accounts on the list send or receive the asset, and a blocklist prevents accounts on the list from sending or receiving it.',
  description: 'An optional description of the asset, at most 195 bytes.',
  logoUri: 'An optional URI of the asset logo, at most 195 bytes.',
  updatableMetadata:
    'Whether privileged accounts can update the description, logo URI and link of the asset after deployment.',
  switchablePolicies:
    'Whether the other standard mint, burn, send and receive policies are registered as allowed alternatives, so that privileged accounts can switch the active policies after deployment. Installs the allowlist and blocklist managers and enables asset callbacks.',
};

export const midenFungibleDescriptions = {
  decimals: 'The number of decimals used to represent token amounts, at most 12. Defaults to 8.',
  maxSupply: 'The maximum number of tokens that can ever be minted, in whole tokens. Defaults to 1000000000.',
  externalLink: 'An optional link to more information about the token, at most 195 bytes.',
  updatableMaxSupply: 'Whether privileged accounts can update the maximum supply after deployment.',
  minBurnAmount:
    'An optional minimum amount of tokens that must be burned at once, in whole tokens. Requires the token to be burnable by its holders. Privileged accounts can update the minimum after deployment.',
};

export const midenNonFungibleDescriptions = {
  contractUri: 'An optional URI of the collection-level metadata, at most 195 bytes.',
};
