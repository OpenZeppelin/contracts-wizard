import type { AiFunctionDefinition } from '../types/function-definition.ts';
import { cairoSharedFunctionDefinition } from './cairo-shared.ts';
import { addFunctionPropertiesFrom } from './shared.ts';
import {
  cairoERC20Descriptions,
  cairoERC721Descriptions,
  cairoERC1155Descriptions,
  cairoAccountDescriptions,
  cairoGovernorDescriptions,
  cairoMultisigDescriptions,
  cairoVestingDescriptions,
} from '../../../../common/src/ai/descriptions/cairo.ts';

export const cairoERC20AIFunctionDefinition = {
  name: 'ERC20',
  description: 'Make a fungible token per the ERC-20 standard.',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoSharedFunctionDefinition, [
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
        description: cairoERC20Descriptions.premint,
      },
      votes: {
        type: 'boolean',
        description: cairoERC20Descriptions.votes,
      },
    },
    required: ['name', 'symbol'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairo', 'ERC20'>;

export const cairoERC721AIFunctionDefinition = {
  name: 'ERC721',
  description: 'Make a non-fungible token per the ERC-721 standard.',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoSharedFunctionDefinition, [
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
      baseUri: { type: 'string', description: cairoERC721Descriptions.baseUri },
      enumerable: {
        type: 'boolean',
        description: cairoERC721Descriptions.enumerable,
      },
      votes: {
        type: 'boolean',
        description: cairoERC721Descriptions.votes,
      },
    },
    required: ['name', 'symbol'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairo', 'ERC721'>;

export const cairoERC1155AIFunctionDefinition = {
  name: 'ERC1155',
  description: 'Make a non-fungible token per the ERC-1155 standard.',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoSharedFunctionDefinition, [
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
        description: cairoERC1155Descriptions.baseUri,
      },
      updatableUri: {
        type: 'boolean',
        description: cairoERC1155Descriptions.updatableUri,
      },
    },
    required: ['name', 'baseUri'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairo', 'ERC1155'>;

export const cairoGovernorAIFunctionDefinition = {
  name: 'Governor',
  description: 'Make a contract to implement governance, such as for a DAO.',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoSharedFunctionDefinition, [
        'name',
        'upgradeable',
        'info',
        'appName',
        'appVersion',
      ]),
      delay: {
        type: 'string',
        description: cairoGovernorDescriptions.delay,
      },
      period: {
        type: 'string',
        description: cairoGovernorDescriptions.period,
      },
      proposalThreshold: {
        type: 'string',
        description: cairoGovernorDescriptions.proposalThreshold,
      },
      decimals: {
        type: 'number',
        description: cairoGovernorDescriptions.decimals,
      },
      quorumMode: {
        type: 'string',
        enum: ['percent', 'absolute'],
        description: cairoGovernorDescriptions.quorumMode,
      },
      quorumPercent: {
        type: 'number',
        description: cairoGovernorDescriptions.quorumPercent,
      },
      quorumAbsolute: {
        type: 'string',
        description: cairoGovernorDescriptions.quorumAbsolute,
      },
      votes: {
        type: 'string',
        enum: ['erc20votes', 'erc721votes'],
        description: cairoGovernorDescriptions.votes,
      },
      clockMode: {
        type: 'string',
        enum: ['timestamp'],
        description: cairoGovernorDescriptions.clockMode,
      },
      timelock: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: ['openzeppelin'] },
        ],
        description: cairoGovernorDescriptions.timelock,
      },
      settings: {
        type: 'boolean',
        description: cairoGovernorDescriptions.settings,
      },
    },
    required: ['name', 'delay', 'period'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairo', 'Governor'>;

export const cairoVestingAIFunctionDefinition = {
  name: 'Vesting',
  description:
    'Make a vesting smart contract that manages the gradual release of ERC-20 tokens to a designated beneficiary based on a predefined vesting schedule',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoSharedFunctionDefinition, ['name', 'info']),
      startDate: {
        type: 'string',
        description: cairoVestingDescriptions.startDate,
      },
      duration: {
        type: 'string',
        description: cairoVestingDescriptions.duration,
      },
      cliffDuration: {
        type: 'string',
        description: cairoVestingDescriptions.cliffDuration,
      },
      schedule: {
        type: 'string',
        enum: ['linear', 'custom'],
        description: cairoVestingDescriptions.schedule,
      },
    },
    required: ['name', 'schedule', 'cliffDuration', 'duration', 'startDate'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairo', 'Vesting'>;

export const cairoAccountAIFunctionDefinition = {
  name: 'Account',
  description:
    'Make a custom smart contract that represents an account that can be deployed and interacted with other contracts, and can be extended to implement custom logic. An account is a special type of contract that is used to validate and execute transactions',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoSharedFunctionDefinition, ['name', 'upgradeable', 'info']),
      type: {
        type: 'string',
        enum: ['stark', 'eth'],
        description: cairoAccountDescriptions.type,
      },
      declare: {
        type: 'boolean',
        description: cairoAccountDescriptions.declare,
      },
      deploy: { type: 'boolean', description: cairoAccountDescriptions.deploy },
      pubkey: { type: 'boolean', description: cairoAccountDescriptions.pubkey },
      outsideExecution: {
        type: 'boolean',
        description: cairoAccountDescriptions.outsideExecution,
      },
    },
    required: ['name', 'type'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairo', 'Account'>;

export const cairoMultisigAIFunctionDefinition = {
  name: 'Multisig',
  description: 'Make a custom smart contract',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoSharedFunctionDefinition, ['name', 'upgradeable', 'info']),
      quorum: {
        type: 'string',
        description: cairoMultisigDescriptions.quorum,
      },
    },
    required: ['name', 'quorum'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairo', 'Multisig'>;

export const cairoCustomAIFunctionDefinition = {
  name: 'Custom',
  description: 'Make a custom smart contract',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoSharedFunctionDefinition, [
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
} as const satisfies AiFunctionDefinition<'cairo', 'Custom'>;
