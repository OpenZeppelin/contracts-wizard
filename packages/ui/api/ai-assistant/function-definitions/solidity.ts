import type { AiFunctionDefinition } from '../types/function-definition.ts';
import { addFunctionProperties } from './shared.ts';

export const erc20Function = {
  name: 'ERC20',
  description: 'Make a fungible token per the ERC-20 standard',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionProperties(['name', 'symbol', 'burnable', 'pausable', 'mintable', 'access', 'upgradeable', 'info']),
      premint: {
        type: 'number',
        description: 'The number of tokens to premint for the deployer.',
      },
      permit: {
        type: 'boolean',
        description:
          'Whether without paying gas, token holders will be able to allow third parties to transfer from their account.',
      },
      votes: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: ['blocknumber', 'timestamp'] },
        ],
        description:
          'Whether to keep track of historical balances for voting in on-chain governance. Voting durations can be expressed as block numbers or timestamps.',
      },
      flashmint: {
        type: 'boolean',
        description:
          "Whether to include built-in flash loans to allow lending tokens without requiring collateral as long as they're returned in the same transaction.",
      },
      crossChainBridging: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: ['custom', 'superchain'] },
        ],
        description:
          'Whether to allow authorized bridge contracts to mint and burn tokens for cross-chain transfers. Options are to use custom bridges on any chain, or the SuperchainERC20 standard with the predeployed SuperchainTokenBridge. Emphasize that these features are experimental, not audited and are subject to change. The SuperchainERC20 feature is only available on chains in the Superchain, and requires deploying your contract to the same address on every chain in the Superchain.',
      },
    },
    required: ['name', 'symbol'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'ERC20', 'premintChainId'>;

export const erc721Function = {
  name: 'ERC721',
  description: 'Make a non-fungible token per the ERC-721 standard',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionProperties(['name', 'symbol', 'burnable', 'pausable', 'mintable', 'access', 'upgradeable', 'info']),
      baseUri: { type: 'string', description: 'A base uri for the token' },
      enumerable: {
        type: 'boolean',
        description:
          'Whether to allow on-chain enumeration of all tokens or those owned by an account. Increases gas cost of transfers.',
      },
      uriStorage: {
        type: 'boolean',
        description: 'Allows updating token URIs for individual token IDs',
      },
      incremental: {
        type: 'boolean',
        description: 'Whether new tokens will be automatically assigned an incremental id',
      },
      votes: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: ['blocknumber', 'timestamp'] },
        ],
        description:
          'Whether to keep track of individual units for voting in on-chain governance. Voting durations can be expressed as block numbers or timestamps.',
      },
    },
    required: ['name', 'symbol'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<
  'ERC721',
  'premintChainId' | 'premint' | 'permit' | 'flashmint' | 'crossChainBridging'
>;

export const erc1155Function = {
  name: 'ERC1155',
  description: 'Make a non-fungible token per the ERC-1155 standard',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionProperties(['name', 'burnable', 'pausable', 'mintable', 'access', 'upgradeable', 'info']),
      uri: {
        type: 'string',
        description:
          'The Location of the metadata for the token. Clients will replace any instance of {id} in this string with the tokenId.',
      },
      supply: {
        type: 'boolean',
        description: 'Whether to keep track of total supply of tokens',
      },
      updatableUri: {
        type: 'boolean',
        description: 'Whether privileged accounts will be able to set a new URI for all token types',
      },
    },
    required: ['name', 'uri'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'ERC1155'>;

export const stablecoinFunction = {
  name: 'Stablecoin',
  description:
    'Make a stablecoin token that uses the ERC-20 standard. Emphasize that this is experimental, and some features are not audited and subject to change.',
  parameters: {
    type: 'object',
    properties: {
      ...erc20Function.parameters.properties,
      custodian: {
        type: 'boolean',
        description:
          'Whether authorized accounts can freeze and unfreeze accounts for regulatory or security purposes. This feature is experimental, not audited and is subject to change.',
      },
      limitations: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: ['allowlist', 'blocklist'] },
        ],
        description:
          'Whether to restrict certain users from transferring tokens, either via allowing or blocking them. This feature is experimental, not audited and is subject to change.',
      },
      upgradeable: {
        type: 'boolean',
        enum: [false],
        description: 'Upgradeability is not yet available for features that use @openzeppelin/community-contracts',
      },
    },
    required: ['name', 'symbol'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'Stablecoin', 'premintChainId'>;

export const realWorldAssetFunction = {
  name: 'RealWorldAsset',
  description:
    'Make a real-world asset token that uses the ERC-20 standard. Emphasize that this is experimental, and some features are not audited and subject to change.',
  parameters: stablecoinFunction.parameters,
} as const satisfies AiFunctionDefinition<'RealWorldAsset', 'premintChainId'>;

export const governorFunction = {
  name: 'Governor',
  description: 'Make a contract to implement governance, such as for a DAO',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionProperties(['name', 'access', 'upgradeable', 'info']),
      delay: {
        type: 'string',
        description: 'The delay since proposal is created until voting starts, default is "1 day"',
      },
      period: {
        type: 'string',
        description: 'The length of period during which people can cast their vote, default is "1 week"',
      },
      blockTime: {
        type: 'number',
        description: 'The number of seconds assumed for a block, default is 12',
      },
      proposalThreshold: {
        type: 'number',
        description: 'Minimum number of votes an account must have to create a proposal, default is 0.',
      },
      decimals: {
        type: 'number',
        description:
          'The number of decimals to use for the contract, default is 18 for ERC20Votes and 0 for ERC721Votes (because it does not apply to ERC721Votes)',
      },
      quorumMode: {
        type: 'string',
        enum: ['percent', 'absolute'],
        description: 'The type of quorum mode to use',
      },
      quorumPercent: {
        type: 'number',
        description: 'The percent required, in cases of quorumMode equals percent',
      },
      quorumAbsolute: {
        type: 'number',
        description: 'The absolute quorum required, in cases of quorumMode equals absolute',
      },
      votes: {
        type: 'string',
        enum: ['erc20votes', 'erc721votes'],
        description: 'The type of voting to use',
      },
      clockMode: {
        type: 'string',
        enum: ['blocknumber', 'timestamp'],
        description:
          'The clock mode used by the voting token. For Governor, this must be chosen to match what the ERC20 or ERC721 voting token uses.',
      },
      timelock: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: ['openzeppelin', 'compound'] },
        ],
        description: 'The type of timelock to use',
      },
      storage: {
        type: 'boolean',
        description: 'Enable storage of proposal details and enumerability of proposals',
      },
      settings: {
        type: 'boolean',
        description: 'Allow governance to update voting settings (delay, period, proposal threshold)',
      },
    },
    required: ['name', 'delay', 'period'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'Governor'>;

export const customFunction = {
  name: 'Custom',
  description: 'Make a custom smart contract',
  parameters: {
    type: 'object',
    properties: addFunctionProperties(['name', 'pausable', 'access', 'upgradeable', 'info']),
    required: ['name'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'Custom'>;
