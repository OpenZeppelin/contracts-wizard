const commonOptions = {
  // 'false' gets converted to false
  access: { type: 'string', enum: ['false', 'ownable', 'roles', 'managed'], description: 'The type of access control to provision. Ownable is a simple mechanism with a single account authorized for all privileged actions. Roles is a flexible mechanism with a separate role for each privileged action. A role can have many authorized accounts. Managed enables a central contract to define a policy that allows certain callers to access certain functions.' },

  // 'false' gets converted to false
  upgradeable: { type: 'string', enum: ['false', 'transparent', 'uups'], description: 'Whether the smart contract is upgradeable. Transparent uses more complex proxy with higher overhead, requires less changes in your contract.Can also be used with beacons. UUPS uses simpler proxy with less overhead, requires including extra code in your contract. Allows flexibility for authorizing upgrades.' },

  info: {
    type: 'object',
    description: 'Metadata about the contract and author',
    properties: {
      securityContact: { type: 'string', description: 'Email where people can contact you to report security issues. Will only be visible if contract metadata is verified.' },
      license: { type: 'string', description: 'The license used by the contract, default is "MIT"' }
    }
  }
}

const repeatedOptions = {
  name: { type: 'string', description: 'The name of the contract' },
  symbol: { type: 'string', description: 'The short symbol for the token' },
  burnable: { type: 'boolean', description: 'Whether token holders will be able to destroy their tokens' },
  pausable: { type: 'boolean', description: 'Whether privileged accounts will be able to pause the functionality marked as whenNotPaused. Useful for emergency response.' },
  mintable: { type: 'boolean', description: 'Whether privileged accounts will be able to create more supply or emit more tokens' },
  votesBoolean: { type: 'boolean', description: 'Whether to keep track of historical balances for voting in on-chain governance, with a way to delegate one\'s voting power to a trusted account.' },
}

export const erc20Function = {
  name: 'erc20',
  description: 'Make a fungible token per the ERC-20 standard',
  parameters: {
    type: 'object',
    properties: {
      name: repeatedOptions.name,
      symbol: repeatedOptions.symbol,
      burnable: repeatedOptions.burnable,
      pausable: repeatedOptions.pausable,
      premint: { type: 'number', description: 'The number of tokens to premint for the deployer.' },
      mintable: repeatedOptions.mintable,
      permit: { type: 'boolean', description: 'Whether without paying gas, token holders will be able to allow third parties to transfer from their account.' },
      votes: repeatedOptions.votesBoolean,
      flashmint: { type: 'boolean', description: 'Whether to include built-in flash loans to allow lending tokens without requiring collateral as long as they\'re returned in the same transaction.' },
      ...commonOptions
    },
    required: ['name', 'symbol'],
  }
}

export const erc721Function = {
  name: 'erc721',
  description: 'Make a non-fungible token per the ERC-721 standard',
  parameters: {
    type: 'object',
    properties: {
      name: repeatedOptions.name,
      symbol: repeatedOptions.symbol,
      baseUri: { type: 'string', description: 'A base uri for the token' },
      enumerable: { type: 'boolean', description: 'Whether to allow on-chain enumeration of all tokens or those owned by an account. Increases gas cost of transfers.' },
      uriStorage: { type: 'boolean', description: 'Allows updating token URIs for individual token IDs'},
      burnable: repeatedOptions.burnable,
      pausable: repeatedOptions.pausable,
      mintable: repeatedOptions.mintable,
      incremental: { type: 'boolean', description: 'Whether new tokens will be automatically assigned an incremental id' },
      votes: repeatedOptions.votesBoolean,
      ...commonOptions
    },
    required: ['name', 'symbol'],
  }
}

export const erc1155Function = {
  name: 'erc1155',
  description: 'Make a non-fungible token per the ERC-1155 standard',
  parameters: {
    type: 'object',
    properties: {
      name: repeatedOptions.name,
      uri: { type: 'string', description: 'The Location of the metadata for the token. Clients will replace any instance of {id} in this string with the tokenId.' },
      burnable: repeatedOptions.burnable,
      pausable: repeatedOptions.pausable,
      mintable: repeatedOptions.mintable,
      supply: { type: 'boolean', description: 'Whether to keep track of total supply of tokens' },
      updatableUri: { type: 'boolean', description: 'Whether privileged accounts will be able to set a new URI for all token types' },
      ...commonOptions
    },
    required: ['name', 'uri'],
  }
}

export const governorFunction = {
  name: 'governor',
  description: 'Make a contract to implement governance, such as for a DAO',
  parameters: {
    type: 'object',
    properties: {
      name: repeatedOptions.name,
      delay: { type: 'string', description: 'The delay since proposal is created until voting starts, default is "1 day"' },
      period: { type: 'string', description: 'The length of period during which people can cast their vote, default is "1 week"' },
      blockTime: { type: 'number', description: 'The number of seconds assumed for a block, default is 12' },
      // gets converted to a string to follow the API
      proposalThreshold: { type: 'number', description: 'Minimum number of votes an account must have to create a proposal, default is 0.' },
      decimals: { type: 'number', description: 'The number of decimals to use for the contract, default is 18 for ERC20Votes and 0 for ERC721Votes (because it does not apply to ERC721Votes)' },
      quorumMode: { type: 'string', enum: ['percent', 'absolute'], description: 'The type of quorum mode to use' },
      quorumPercent: { type: 'number', description: 'The percent required, in cases of quorumMode equals percent' },
      // gets converted to a string to follow the API
      quorumAbsolute: { type: 'number', description: 'The absolute quorum required, in cases of quorumMode equals absolute' },
      votes: { type: 'string', enum: ['erc20votes', 'erc721votes'], description: 'The type of voting to use' },
      // 'false' gets converted to false
      timelock: { type: 'string', enum: ['false', 'openzeppelin', 'compound'], description: 'The type of timelock to use' },
      storage: { type: 'boolean', description: 'Enable storage of proposal details and enumerability of proposals' },
      settings: { type: 'boolean', description: 'Allow governance to update voting settings (delay, period, proposal threshold)' },
      ...commonOptions
    },
    required: ['name', 'delay', 'period'],
  }
}

export const customFunction = {
  name: 'custom',
  description: 'Make a custom smart contract',
  parameters: {
    type: 'object',
    properties: {
      name: repeatedOptions.name,
      pausable: repeatedOptions.pausable,
      ...commonOptions
    },
    required: ['name'],
  }
}
