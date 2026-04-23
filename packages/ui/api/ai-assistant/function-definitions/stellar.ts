import { contractExactRequiredKeys, type AiFunctionDefinition } from '../types/function-definition.ts';
import { addFunctionPropertiesFrom } from './shared.ts';
import { stellarCommonFunctionDescription } from './stellar-shared.ts';
import {
  stellarPrompts,
  stellarCommonDescriptions,
  stellarFungibleDescriptions,
  stellarGovernorDescriptions,
  stellarNonFungibleDescriptions,
  stellarStablecoinDescriptions,
} from '../../../../common/src/ai/descriptions/stellar.ts';
import { extractStringEnumValues } from '../types/helpers.ts';
import type { Limitations } from '../../../../core/stellar/dist/stablecoin';

export const stellarFungibleAIFunctionDefinition = {
  name: 'Fungible',
  description: stellarPrompts.Fungible,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(stellarCommonFunctionDescription, [
        'name',
        'symbol',
        'burnable',
        'pausable',
        'upgradeable',
        'mintable',
        'access',
        'info',
        'explicitImplementations',
      ]),
      premint: {
        type: 'string',
        description: stellarFungibleDescriptions.premint,
      },
      votes: {
        type: 'boolean',
        description: stellarFungibleDescriptions.votes,
      },
    },
    required: contractExactRequiredKeys<'stellar', 'Fungible'>()(['name', 'symbol']),
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'stellar', 'Fungible'>;

export const stellarStablecoinAIFunctionDefinition = {
  name: 'Stablecoin',
  description: stellarPrompts.Stablecoin,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(stellarCommonFunctionDescription, [
        'name',
        'symbol',
        'burnable',
        'pausable',
        'mintable',
        'access',
        'info',
        'explicitImplementations',
      ]),
      limitations: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: extractStringEnumValues<Limitations>()(['allowlist', 'blocklist']) },
        ],
        description: stellarStablecoinDescriptions.limitations,
      },
      premint: {
        type: 'string',
        description: stellarStablecoinDescriptions.premint,
      },
      upgradeable: {
        type: 'boolean',
        description: stellarCommonDescriptions.upgradeable,
      },
      votes: {
        type: 'boolean',
        description: stellarStablecoinDescriptions.votes,
      },
    },
    required: contractExactRequiredKeys<'stellar', 'Stablecoin'>()(['name', 'symbol']),
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'stellar', 'Stablecoin'>;

export const stellarNonFungibleAIFunctionDefinition = {
  name: 'NonFungible',
  description: stellarPrompts.NonFungible,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(stellarCommonFunctionDescription, [
        'name',
        'symbol',
        'burnable',
        'pausable',
        'upgradeable',
        'mintable',
        'access',
        'info',
        'explicitImplementations',
      ]),
      enumerable: {
        type: 'boolean',
        description: stellarNonFungibleDescriptions.enumerable,
      },
      consecutive: {
        type: 'boolean',
        description: stellarNonFungibleDescriptions.consecutive,
      },
      sequential: {
        type: 'boolean',
        description: stellarNonFungibleDescriptions.sequential,
      },
      tokenUri: {
        type: 'string',
        description: stellarNonFungibleDescriptions.tokenUri,
      },
      upgradeable: {
        type: 'boolean',
        description: stellarCommonDescriptions.upgradeable,
      },
      votes: {
        type: 'boolean',
        description: stellarNonFungibleDescriptions.votes,
      },
    },
    required: contractExactRequiredKeys<'stellar', 'NonFungible'>()(['name', 'symbol']),
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'stellar', 'NonFungible'>;

export const stellarGovernorAIFunctionDefinition = {
  name: 'Governor',
  description: stellarPrompts.Governor,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(stellarCommonFunctionDescription, [
        'name',
        'upgradeable',
        'access',
        'info',
        'explicitImplementations',
      ]),
      version: {
        type: 'string',
        description: stellarGovernorDescriptions.version,
      },
      votingDelay: {
        type: 'string',
        description: stellarGovernorDescriptions.votingDelay,
      },
      votingPeriod: {
        type: 'string',
        description: stellarGovernorDescriptions.votingPeriod,
      },
      proposalThreshold: {
        type: 'string',
        description: stellarGovernorDescriptions.proposalThreshold,
      },
      quorum: {
        type: 'string',
        description: stellarGovernorDescriptions.quorum,
      },
      timelock: {
        type: 'boolean',
        description: stellarGovernorDescriptions.timelock,
      },
    },
    required: contractExactRequiredKeys<'stellar', 'Governor'>()(['name']),
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'stellar', 'Governor'>;
