import type { AiFunctionDefinition } from '../types/function-definition.ts';
import { cairoAlphaSharedFunctionDefinition } from './cairo-alpha-shared.ts';
import { addFunctionPropertiesFrom } from './shared.ts';

export const cairoAlphaERC20AIFunctionDefinition = {
  name: 'ERC20',
  description: 'Make a fungible token per the ERC-20 standard.',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoAlphaSharedFunctionDefinition, [
        'name',
        'symbol',
        'burnable',
        'pausable',
        'mintable',
        'access',
        'upgradeable',
        'info',
        'appName',
        'appVersion',
      ]),
      premint: {
        type: 'string',
        description: 'The number of tokens to premint for the deployer.',
      },
      votes: {
        type: 'boolean',
        description:
          "Whether to keep track of historical balances for voting in on-chain governance, with a way to delegate one's voting power to a trusted account.",
      },
    },
    required: ['name', 'symbol'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairoAlpha', 'ERC20'>;

export const cairoAlphaERC721AIFunctionDefinition = {
  name: 'ERC721',
  description: 'Make a non-fungible token per the ERC-721 standard.',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoAlphaSharedFunctionDefinition, [
        'name',
        'symbol',
        'access',
        'burnable',
        'pausable',
        'mintable',
        'upgradeable',
        'info',
        'royaltyInfo',
        'appName',
        'appVersion',
      ]),
      baseUri: { type: 'string', description: 'A base uri for the non-fungible token.' },
      enumerable: {
        type: 'boolean',
        description:
          'Whether to allow on-chain enumeration of all tokens or those owned by an account. Increases gas cost of transfers.',
      },
      votes: {
        type: 'boolean',
        description:
          'Whether to keep track of individual units for voting in on-chain governance. Voting durations can be expressed as block numbers or timestamps.',
      },
    },
    required: ['name', 'symbol'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairoAlpha', 'ERC721'>;

export const cairoAlphaERC1155AIFunctionDefinition = {
  name: 'ERC1155',
  description: 'Make a non-fungible token per the ERC-1155 standard.',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoAlphaSharedFunctionDefinition, [
        'name',
        'burnable',
        'pausable',
        'mintable',
        'access',
        'upgradeable',
        'info',
        'royaltyInfo',
      ]),
      baseUri: {
        type: 'string',
        description:
          'The Location of the metadata for the token. Clients will replace any instance of {id} in this string with the tokenId.',
      },
      updatableUri: {
        type: 'boolean',
        description: 'Whether privileged accounts will be able to set a new URI for all token types.',
      },
    },
    required: ['name', 'baseUri'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairoAlpha', 'ERC1155'>;

export const cairoAlphaGovernorAIFunctionDefinition = {
  name: 'Governor',
  description: 'Make a contract to implement governance, such as for a DAO.',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoAlphaSharedFunctionDefinition, [
        'name',
        'upgradeable',
        'info',
        'appName',
        'appVersion',
      ]),
      delay: {
        type: 'string',
        description:
          'The delay since proposal is created until voting starts, in readable date time format matching /^(\\d+(?:\\.\\d+)?) +(second|minute|hour|day|week|month|year)s?$/, default is "1 day".',
      },
      period: {
        type: 'string',
        description:
          'The length of period during which people can cast their vote, in readable date time format matching /^(\\d+(?:\\.\\d+)?) +(second|minute|hour|day|week|month|year)s?$/, default is "1 week".',
      },
      proposalThreshold: {
        type: 'string',
        description: 'Minimum number of votes an account must have to create a proposal, default is 0.',
      },
      decimals: {
        type: 'number',
        description:
          'The number of decimals to use for the contract, unless otherwise specified default is 18 for ERC20Votes and 0 for ERC721Votes (because it does not apply to ERC721Votes).',
      },
      quorumMode: {
        type: 'string',
        enum: ['percent', 'absolute'],
        description: 'The type of quorum mode to use, either by percentage or absolute value.',
      },
      quorumPercent: {
        type: 'number',
        description: 'The percent required, in cases of quorumMode equals percent.',
      },
      quorumAbsolute: {
        type: 'string',
        description: 'The absolute quorum required, in cases of quorumMode equals absolute.',
      },
      votes: {
        type: 'string',
        enum: ['erc20votes', 'erc721votes'],
        description:
          'The type of voting to use. Either erc20votes, meaning voting power with a votes-enabled ERC20 token. Either erc721votes, meaning voting power with a votes-enabled ERC721 token. Voters can entrust their voting power to a delegate.',
      },
      clockMode: {
        type: 'string',
        enum: ['timestamp'],
        description:
          'The clock mode used by the voting token. For now, only timestamp mode where the token uses voting durations expressed as timestamps is supported. For Governor, this must be chosen to match what the ERC20 or ERC721 voting token uses.',
      },
      timelock: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: ['openzeppelin'] },
        ],
        description:
          'Whether to add a delay to actions taken by the Governor. Gives users time to exit the system if they disagree with governance decisions. If "openzeppelin", Module compatible with OpenZeppelin\'s TimelockController.',
      },
      settings: {
        type: 'boolean',
        description: 'Whether to allow governance to update voting settings (delay, period, proposal threshold).',
      },
    },
    required: ['name', 'delay', 'period'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairoAlpha', 'Governor'>;

export const cairoAlphaVestingAIFunctionDefinition = {
  name: 'Vesting',
  description:
    'Make a vesting smart contract that manages the gradual release of ERC-20 tokens to a designated beneficiary based on a predefined vesting schedule',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoAlphaSharedFunctionDefinition, ['name', 'info']),
      startDate: {
        type: 'string',
        description: 'The timestamp marking the beginning of the vesting period. In HTML input datetime-local format',
      },
      duration: {
        type: 'string',
        description:
          'The total duration of the vesting period. In readable date time format matching /^(\\d+(?:\\.\\d+)?) +(second|minute|hour|day|week|month|year)s?$/',
      },
      cliffDuration: {
        type: 'string',
        description:
          'The duration of the cliff period. Must be less than or equal to the total duration. In readable date time format matching /^(\\d+(?:\\.\\d+)?) +(second|minute|hour|day|week|month|year)s?$/',
      },
      schedule: {
        type: 'string',
        enum: ['linear', 'custom'],
        description:
          'A vesting schedule implementation, tokens can either be vested gradually following a linear curve or with custom vesting schedule that requires the implementation of the VestingSchedule trait.',
      },
    },
    required: ['name', 'schedule', 'cliffDuration', 'duration', 'startDate'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairoAlpha', 'Vesting'>;

export const cairoAlphaAccountAIFunctionDefinition = {
  name: 'Account',
  description:
    'Make a custom smart contract that represents an account that can be deployed and interacted with other contracts, and can be extended to implement custom logic. An account is a special type of contract that is used to validate and execute transactions',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoAlphaSharedFunctionDefinition, ['name', 'upgradeable', 'info']),
      type: {
        type: 'string',
        enum: ['stark', 'eth'],
        description:
          'Type of signature used for signature checking by the Account contract, Starknet account uses the STARK curve, Ethereum-flavored account uses the Secp256k1 curve.',
      },
      declare: {
        type: 'boolean',
        description: 'Whether to enable the account to declare other contract classes.',
      },
      deploy: { type: 'boolean', description: 'Whether to enables the account to be counterfactually deployed.' },
      pubkey: { type: 'boolean', description: 'Whether to enables the account to change its own public key.' },
      outsideExecution: {
        type: 'boolean',
        description:
          'Whether to allow a protocol to submit transactions on behalf of the account, as long as it has the relevant signatures.',
      },
    },
    required: ['name', 'type'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairoAlpha', 'Account'>;

export const cairoAlphaMultisigAIFunctionDefinition = {
  name: 'Multisig',
  description: 'Make a custom smart contract',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoAlphaSharedFunctionDefinition, ['name', 'upgradeable', 'info']),
      quorum: {
        type: 'string',
        description: 'The minimal number of confirmations required by the Multisig to approve a transaction.',
      },
    },
    required: ['name', 'quorum'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairoAlpha', 'Multisig'>;

export const cairoAlphaCustomAIFunctionDefinition = {
  name: 'Custom',
  description: 'Make a custom smart contract',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoAlphaSharedFunctionDefinition, [
        'name',
        'pausable',
        'access',
        'upgradeable',
        'info',
      ]),
    },
    required: ['name'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairoAlpha', 'Custom'>;
