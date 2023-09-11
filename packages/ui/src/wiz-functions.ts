export const erc20Function = {
  name: 'erc20',
  description: 'Make a fungible token per the ERC-20 standard',
  parameters: {
    type: 'object',
    properties: {
      name: { type: 'string', description: 'The name of the token' },
      symbol: { type: 'string', description: 'The short symbol for the token' },
      burnable: { type: 'boolean', description: 'Whether the token is burnable' },
      snapshots: { type: 'boolean', description: 'Whether the token is snapshotable' },
      pausable: { type: 'boolean', description: 'Whether the token is pausable' },
      premint: { type: 'string', description: 'The number of tokens to premint' },
      mintable: { type: 'boolean', description: 'Whether the token is mintable' },
      permit: { type: 'boolean', description: 'Whether the token is permitable' },
      votes: { type: 'boolean', description: 'Whether the token is votable' },
      flashmint: { type: 'boolean', description: 'Whether the token is flashmintable' },
      access: { type: 'string', enum: ['false', 'ownable', 'roles'], description: 'The type of access control to provision' },
      upgrade: { type: 'string', enum: ['false', 'transparent', 'uups'], description: 'Whether and how the contract can be upgraded' },
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
      name: { type: 'string', description: 'The name of the token' },
      symbol: { type: 'string', description: 'The short symbol for the token' },
      burnable: { type: 'boolean', description: 'Whether the token is burnable' },
      pausable: { type: 'boolean', description: 'Whether the token is pausable' },
      mintable: { type: 'boolean', description: 'Whether the token is mintable' },
      baseUri: { type: 'string', description: 'A base uri for the token' },
      enumerable: { type: 'boolean', description: 'Whether the token is enumerable' },
      uriStorage: { type: 'boolean', description: 'Whether the token uses uri storage' },
      incremental: { type: 'boolean', description: 'Whether the token is incremental' },
      votes: { type: 'boolean', description: 'Whether the token is votable' },
      access: { type: 'string', enum: ['false', 'ownable', 'roles'], description: 'The type of access control to provision' },
      upgrade: { type: 'string', enum: ['false', 'transparent', 'uups'], description: 'Whether and how the contract can be upgraded' },
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
      name: { type: 'string', description: 'The name of the token' },
      uri: { type: 'string', description: 'The uri for the token' },
      burnable: { type: 'boolean', description: 'Whether the token is burnable' },
      pausable: { type: 'boolean', description: 'Whether the token is pausable' },
      mintable: { type: 'boolean', description: 'Whether the token is mintable' },
      supply: { type: 'boolean', description: 'Whether the token has a supply' },
      updatableUri: { type: 'boolean', description: 'Whether the token uri is updateable uri storage' },
      access: { type: 'string', enum: ['false', 'ownable', 'roles'], description: 'The type of access control to provision' },
      upgrade: { type: 'string', enum: ['false', 'transparent', 'uups'], description: 'Whether and how the contract can be upgraded' },
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
      name: { type: 'string', description: 'The name of the contract' },
      delay: { type: 'string', description: 'The delay for the contract' },
      period: { type: 'string', description: 'The period for the contract' },
      blockTime: { type: 'number', description: 'The block time for the contract' },
      proposalThreshold: { type: 'string', description: 'The proposal threshold for the contract' },
      decimals: { type: 'number', description: 'The number of decimals to use for the contract' },
      quorumMode: { type: 'string', enum: ['percent', 'absolute'], description: 'The type of quorum mode to use' },
      quorumPercent: { type: 'number', description: 'The percent required, in cases of quorumMode equals percent' },
      quorumAbsolute: { type: 'string', description: 'The asolute quorum required, in cases of quorumMode equals absolute' },
      votes: { type: 'string', enum: ['erc20votes', 'erc721votes' , 'comp'], description: 'The type of voting to use' },
      timelock: { type: 'string', enum: ['false', 'openzeppelin', 'compound'], description: 'The type of timelock to use' },
      bravo: { type: 'boolean', description: 'Whether the contract is bravo' },
      settings: { type: 'boolean', description: 'Whether the contract has settings' },
      access: { type: 'string', enum: ['false', 'ownable', 'roles'], description: 'The type of access control to provision' },
      upgrade: { type: 'string', enum: ['false', 'transparent', 'uups'], description: 'Whether and how the contract can be upgraded' },
    },
    required: ['name', 'delay', 'period'],
  }
}