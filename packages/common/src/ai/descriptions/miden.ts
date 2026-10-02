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
    "Who controls the faucet. 'singleKey': a user account where one key holder signs every transaction of the faucet itself, such as minting and processing burn requests, while token transfers don't need the faucet's key; it can't be combined with burnPolicy 'ownerOnly', in which case 'ownable' is used. 'ownable': a network account managed by an owner account, with two-step ownership transfer. 'roles': a network account with a separate role for each privileged action, where a role can have many authorized accounts; minting is the exception: it is done by the faucet owner, initially the admin.",
  pausable:
    'Whether privileged accounts will be able to pause minting, burning and metadata updates, and also transfers when pausableTransfers is true or a transfer policy is active. Useful for emergency response.',
  pausableTransfers:
    'Whether pausing also stops transfers. Every transfer then consults the faucet, so transfers cost more to prove and must reach the chain within about a minute. This extra cost is permanent. If false, pausing stops only minting, burning and metadata updates. Requires pausable; implied by a transfer policy.',
  transferPolicy:
    "Restricts who can send and receive the asset. 'allowlist': only accounts on the allowlist can send or receive the asset; the list starts empty, so privileged accounts must add an account before it can receive the asset, including newly minted ones. 'blocklist': accounts on the blocklist can neither send nor receive the asset; privileged accounts manage the blocklist. Every transfer then consults the faucet, so transfers cost more to prove and must reach the chain within about a minute. This extra cost is permanent.",
  switchableTransferPolicy:
    'Whether privileged accounts will be able to turn on an allowlist or blocklist after deployment, and switch between them, which can freeze transfers. Every transfer then consults the faucet, so transfers cost more to prove. This extra cost is permanent.',
  description: 'An optional description of the asset.',
  logoUri: 'An optional URI of the asset logo.',
};

export const midenFungibleDescriptions = {
  decimals: 'The number of decimals used to represent token amounts. Defaults to 8, with a maximum of 12.',
  maxSupply: 'The maximum number of tokens in circulation at any time. Burning frees room to mint again.',
  externalLink: 'An optional link to more information about the token.',
  updatableMetadata:
    'Whether privileged accounts will be able to update the description, logo URI and external link after deployment. The name, symbol and decimals can never change.',
  updatableMaxSupply: 'Whether privileged accounts will be able to update the maximum supply after deployment.',
  burnPolicy:
    "Who can burn tokens. 'anyHolder' (default): token holders will be able to destroy their tokens. 'minimumAmount': token holders will be able to destroy their tokens, at least minBurnAmount at a time; privileged accounts can change the minimum after deployment, and tokens in a smaller burn request stay locked until the minimum is lowered. 'ownerOnly': only the faucet owner can destroy the tokens it holds, and tokens that other holders try to destroy are permanently locked instead.",
  minBurnAmount:
    "The minimum number of tokens per burn. Required by, and only allowed with, the 'minimumAmount' burn policy.",
};

export const midenNonFungibleDescriptions = {
  contractUri: 'An optional URI of the collection-level metadata.',
  updatableMetadata:
    'Whether privileged accounts will be able to update the description, logo URI and contract URI after deployment. The name and symbol can never change.',
  burnPolicy:
    "Who can burn tokens. 'anyHolder' (default): token holders will be able to destroy their tokens. 'ownerOnly': only the faucet owner can destroy the tokens it holds, and tokens that other holders try to destroy are permanently locked instead.",
};
