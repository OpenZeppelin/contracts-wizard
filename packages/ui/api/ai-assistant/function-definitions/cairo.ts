import { contractExactRequiredKeys, type AiFunctionDefinition } from '../types/function-definition.ts';
import { cairoSharedFunctionDefinition } from './cairo-shared.ts';
import { addFunctionPropertiesFrom } from './shared.ts';
import {
  cairoPrompts,
  cairoERC20Descriptions,
  cairoERC721Descriptions,
  cairoERC1155Descriptions,
  cairoERC6909Descriptions,
  cairoAccountDescriptions,
  cairoGovernorDescriptions,
  cairoMultisigDescriptions,
  cairoVestingDescriptions,
} from '../../../../common/src/ai/descriptions/cairo.ts';
import { enumValues, extractStringEnumValues } from '../types/helpers.ts';
import type { ClockMode, QuorumMode, TimelockOptions, VotesOptions } from '../../../../core/cairo/dist/governor';
import type { VestingSchedule } from '../../../../core/cairo/dist/vesting';
import type { Account } from '../../../../core/cairo/dist/account';

export const cairoERC20AIFunctionDefinition = {
  name: 'ERC20',
  description: cairoPrompts.ERC20,
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
        'macros',
        'appName',
        'appVersion',
      ]),
      decimals: {
        type: 'string',
        description: cairoERC20Descriptions.decimals,
      },
      premint: {
        type: 'string',
        description: cairoERC20Descriptions.premint,
      },
      wrapper: {
        type: 'boolean',
        description: cairoERC20Descriptions.wrapper,
      },
      votes: {
        type: 'boolean',
        description: cairoERC20Descriptions.votes,
      },
    },
    required: contractExactRequiredKeys<'cairo', 'ERC20'>()(['name', 'symbol']),
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairo', 'ERC20'>;

export const cairoERC721AIFunctionDefinition = {
  name: 'ERC721',
  description: cairoPrompts.ERC721,
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
        'macros',
        'royaltyInfo',
        'appName',
        'appVersion',
      ]),
      baseUri: { type: 'string', description: cairoERC721Descriptions.baseUri },
      enumerable: {
        type: 'boolean',
        description: cairoERC721Descriptions.enumerable,
      },
      consecutive: {
        type: 'boolean',
        description: cairoERC721Descriptions.consecutive,
      },
      wrapper: {
        type: 'boolean',
        description: cairoERC721Descriptions.wrapper,
      },
      votes: {
        type: 'boolean',
        description: cairoERC721Descriptions.votes,
      },
      uriStorage: {
        type: 'boolean',
        description: cairoERC721Descriptions.uriStorage,
      },
    },
    required: contractExactRequiredKeys<'cairo', 'ERC721'>()(['name', 'symbol']),
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairo', 'ERC721'>;

export const cairoERC1155AIFunctionDefinition = {
  name: 'ERC1155',
  description: cairoPrompts.ERC1155,
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
        'macros',
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
      supply: {
        type: 'boolean',
        description: cairoERC1155Descriptions.supply,
      },
      uriStorage: {
        type: 'boolean',
        description: cairoERC1155Descriptions.uriStorage,
      },
    },
    required: contractExactRequiredKeys<'cairo', 'ERC1155'>()(['name', 'baseUri']),
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairo', 'ERC1155'>;

export const cairoERC6909AIFunctionDefinition = {
  name: 'ERC6909',
  description: cairoPrompts.ERC6909,
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
        'macros',
      ]),
      contentUri: {
        type: 'boolean',
        description: cairoERC6909Descriptions.contentUri,
      },
      tokenSupply: {
        type: 'boolean',
        description: cairoERC6909Descriptions.tokenSupply,
      },
      metadata: {
        type: 'boolean',
        description: cairoERC6909Descriptions.metadata,
      },
    },
    required: contractExactRequiredKeys<'cairo', 'ERC6909'>()(['name']),
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairo', 'ERC6909'>;

export const cairoGovernorAIFunctionDefinition = {
  name: 'Governor',
  description: cairoPrompts.Governor,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoSharedFunctionDefinition, [
        'name',
        'upgradeable',
        'info',
        'macros',
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
        enum: enumValues<QuorumMode>()(['percent', 'absolute']),
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
        enum: enumValues<VotesOptions>()(['erc20votes', 'erc721votes']),
        description: cairoGovernorDescriptions.votes,
      },
      clockMode: {
        type: 'string',
        enum: enumValues<ClockMode>()(['timestamp']),
        description: cairoGovernorDescriptions.clockMode,
      },
      timelock: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: extractStringEnumValues<TimelockOptions>()(['openzeppelin']) },
        ],
        description: cairoGovernorDescriptions.timelock,
      },
      settings: {
        type: 'boolean',
        description: cairoGovernorDescriptions.settings,
      },
    },
    required: contractExactRequiredKeys<'cairo', 'Governor'>()(['name', 'delay', 'period']),
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairo', 'Governor'>;

export const cairoVestingAIFunctionDefinition = {
  name: 'Vesting',
  description: cairoPrompts.Vesting,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoSharedFunctionDefinition, ['name', 'info', 'macros']),
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
        enum: enumValues<VestingSchedule>()(['linear', 'custom']),
        description: cairoVestingDescriptions.schedule,
      },
    },
    required: contractExactRequiredKeys<'cairo', 'Vesting'>()([
      'name',
      'schedule',
      'cliffDuration',
      'duration',
      'startDate',
    ]),
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairo', 'Vesting'>;

export const cairoAccountAIFunctionDefinition = {
  name: 'Account',
  description: cairoPrompts.Account,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoSharedFunctionDefinition, ['name', 'upgradeable', 'info', 'macros']),
      type: {
        type: 'string',
        enum: enumValues<Account>()(['stark', 'eth']),
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
    required: contractExactRequiredKeys<'cairo', 'Account'>()(['name', 'type']),
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairo', 'Account'>;

export const cairoMultisigAIFunctionDefinition = {
  name: 'Multisig',
  description: cairoPrompts.Multisig,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoSharedFunctionDefinition, ['name', 'upgradeable', 'info', 'macros']),
      quorum: {
        type: 'string',
        description: cairoMultisigDescriptions.quorum,
      },
    },
    required: contractExactRequiredKeys<'cairo', 'Multisig'>()(['name', 'quorum']),
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairo', 'Multisig'>;

export const cairoCustomAIFunctionDefinition = {
  name: 'Custom',
  description: cairoPrompts.Custom,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(cairoSharedFunctionDefinition, [
        'name',
        'pausable',
        'access',
        'upgradeable',
        'info',
        'macros',
      ]),
    },
    required: contractExactRequiredKeys<'cairo', 'Custom'>()(['name']),
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'cairo', 'Custom'>;
