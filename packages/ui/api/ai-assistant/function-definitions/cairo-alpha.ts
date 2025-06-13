import type { AiFunctionDefinition } from '../types/function-definition.ts';
import { cairoAlphaSharedFunctionDefinition } from './cairo-alpha-shared.ts';
import { addFunctionPropertiesFrom } from './shared.ts';
import {
  cairoPrompts,
  cairoERC20Descriptions,
  cairoERC721Descriptions,
  cairoERC1155Descriptions,
  cairoAccountDescriptions,
  cairoGovernorDescriptions,
  cairoMultisigDescriptions,
  cairoVestingDescriptions,
} from '../../../../common/src/ai/descriptions/cairo.ts';

export const cairoAlphaERC20AIFunctionDefinition = {
  name: 'ERC20',
  description: cairoPrompts.ERC20,
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
} as const satisfies AiFunctionDefinition<'cairoAlpha', 'ERC20'>;

export const cairoAlphaERC721AIFunctionDefinition = {
  name: 'ERC721',
  description: cairoPrompts.ERC721,
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
} as const satisfies AiFunctionDefinition<'cairoAlpha', 'ERC721'>;

export const cairoAlphaERC1155AIFunctionDefinition = {
  name: 'ERC1155',
  description: cairoPrompts.ERC1155,
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
} as const satisfies AiFunctionDefinition<'cairoAlpha', 'ERC1155'>;

export const cairoAlphaGovernorAIFunctionDefinition = {
  name: 'Governor',
  description: cairoPrompts.Governor,
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
} as const satisfies AiFunctionDefinition<'cairoAlpha', 'Governor'>;

export const cairoAlphaVestingAIFunctionDefinition = {
  name: 'Vesting',
  description: cairoPrompts.Vesting,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoAlphaSharedFunctionDefinition, ['name', 'info']),
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
} as const satisfies AiFunctionDefinition<'cairoAlpha', 'Vesting'>;

export const cairoAlphaAccountAIFunctionDefinition = {
  name: 'Account',
  description: cairoPrompts.Account,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoAlphaSharedFunctionDefinition, ['name', 'upgradeable', 'info']),
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
} as const satisfies AiFunctionDefinition<'cairoAlpha', 'Account'>;

export const cairoAlphaMultisigAIFunctionDefinition = {
  name: 'Multisig',
  description: cairoPrompts.Multisig,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoAlphaSharedFunctionDefinition, ['name', 'upgradeable', 'info']),
      quorum: {
        type: 'string',
        description: cairoMultisigDescriptions.quorum,
      },
    },
    required: ['name', 'quorum'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairoAlpha', 'Multisig'>;

export const cairoAlphaCustomAIFunctionDefinition = {
  name: 'Custom',
  description: cairoPrompts.Custom,
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
