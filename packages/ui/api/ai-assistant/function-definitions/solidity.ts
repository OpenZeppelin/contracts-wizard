import type { AiFunctionDefinition } from '../types/function-definition.ts';
import { addFunctionPropertiesFrom } from './shared.ts';
import { commonFunctionDescription } from './solidity-shared.ts';
import {
  solidityPrompts,
  solidityAccountDescriptions,
  solidityERC20Descriptions,
  solidityERC721Descriptions,
  solidityERC1155Descriptions,
  solidityStablecoinDescriptions,
  solidityGovernorDescriptions,
} from '../../../../common/src/ai/descriptions/solidity.ts';
import { enumValues, extractStringEnumValues } from '../types/helpers.ts';
import type { QuorumMode, TimelockOptions, VotesOptions } from '../../../../core/solidity/dist/governor';
import type { ClockMode } from '../../../../core/solidity/dist/set-clock-mode';
import type { CrossChainBridging } from '../../../../core/solidity/dist/erc20';
import type { Limitations } from '../../../../core/solidity/dist/stablecoin';
import type { ERC7579ModulesOptions, SignatureValidationOptions } from '../../../../core/solidity/dist/account';
import type { SignerOptions } from '../../../../core/solidity/dist/signer';

export const solidityERC20AIFunctionDefinition = {
  name: 'ERC20',
  description: solidityPrompts.ERC20,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(commonFunctionDescription, [
        'name',
        'symbol',
        'burnable',
        'pausable',
        'mintable',
        'access',
        'upgradeable',
        'info',
      ]),
      premint: {
        type: 'string',
        description: solidityERC20Descriptions.premint,
      },
      permit: {
        type: 'boolean',
        description: solidityERC20Descriptions.permit,
      },
      votes: {
        anyOf: [
          { type: 'boolean', enum: [false, true] },
          { type: 'string', enum: extractStringEnumValues<ClockMode>()(['blocknumber', 'timestamp']) },
        ],
        description: solidityERC20Descriptions.votes,
      },
      flashmint: {
        type: 'boolean',
        description: solidityERC20Descriptions.flashmint,
      },
      crossChainBridging: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: extractStringEnumValues<CrossChainBridging>()(['custom', 'superchain']) },
        ],
        description: solidityERC20Descriptions.crossChainBridging,
      },
      premintChainId: {
        type: 'string',
        description: solidityERC20Descriptions.premintChainId,
      },
      callback: {
        type: 'boolean',
        description: solidityERC20Descriptions.callback,
      },
    },
    required: ['name', 'symbol'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'solidity', 'ERC20'>;

export const solidityERC721AIFunctionDefinition = {
  name: 'ERC721',
  description: solidityPrompts.ERC721,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(commonFunctionDescription, [
        'name',
        'symbol',
        'burnable',
        'pausable',
        'mintable',
        'access',
        'upgradeable',
        'info',
      ]),
      baseUri: { type: 'string', description: solidityERC721Descriptions.baseUri },
      enumerable: {
        type: 'boolean',
        description: solidityERC721Descriptions.enumerable,
      },
      uriStorage: {
        type: 'boolean',
        description: solidityERC721Descriptions.uriStorage,
      },
      incremental: {
        type: 'boolean',
        description: solidityERC721Descriptions.incremental,
      },
      votes: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: extractStringEnumValues<ClockMode>()(['blocknumber', 'timestamp']) },
        ],
        description: solidityERC721Descriptions.votes,
      },
    },
    required: ['name', 'symbol'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'solidity', 'ERC721'>;

export const solidityERC1155AIFunctionDefinition = {
  name: 'ERC1155',
  description: solidityPrompts.ERC1155,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(commonFunctionDescription, [
        'name',
        'burnable',
        'pausable',
        'mintable',
        'access',
        'upgradeable',
        'info',
      ]),
      uri: {
        type: 'string',
        description: solidityERC1155Descriptions.uri,
      },
      supply: {
        type: 'boolean',
        description: solidityERC1155Descriptions.supply,
      },
      updatableUri: {
        type: 'boolean',
        description: solidityERC1155Descriptions.updatableUri,
      },
    },
    required: ['name', 'uri'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'solidity', 'ERC1155'>;

export const solidityStablecoinAIFunctionDefinition = {
  name: 'Stablecoin',
  description: solidityPrompts.Stablecoin,
  parameters: {
    type: 'object',
    properties: {
      ...solidityERC20AIFunctionDefinition.parameters.properties,
      custodian: {
        type: 'boolean',
        description: solidityStablecoinDescriptions.custodian,
      },
      limitations: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: extractStringEnumValues<Limitations>()(['allowlist', 'blocklist']) },
        ],
        description: solidityStablecoinDescriptions.limitations,
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
} as const satisfies AiFunctionDefinition<'solidity', 'Stablecoin'>;

export const solidityRealWorldAssetAIFunctionDefinition = {
  name: 'RealWorldAsset',
  description: solidityPrompts.RWA,
  parameters: solidityStablecoinAIFunctionDefinition.parameters,
} as const satisfies AiFunctionDefinition<'solidity', 'RealWorldAsset'>;

export const solidityAccountAIFunctionDefinition = {
  name: 'Account',
  description: solidityPrompts.Account,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(commonFunctionDescription, ['name', 'upgradeable', 'info']),
      signatureValidation: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: extractStringEnumValues<SignatureValidationOptions>()(['ERC1271', 'ERC7739']) },
        ],
        description: solidityAccountDescriptions.signatureValidation,
      },
      ERC721Holder: {
        type: 'boolean',
        description: solidityAccountDescriptions.ERC721Holder,
      },
      ERC1155Holder: {
        type: 'boolean',
        description: solidityAccountDescriptions.ERC1155Holder,
      },
      signer: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          {
            type: 'string',
            enum: extractStringEnumValues<SignerOptions>()([
              'ECDSA',
              'ERC7702',
              'P256',
              'RSA',
              'Multisig',
              'MultisigWeighted',
            ]),
          },
        ],
        description: solidityAccountDescriptions.signer,
      },
      batchedExecution: {
        type: 'boolean',
        description: solidityAccountDescriptions.batchedExecution,
      },
      ERC7579Modules: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          {
            type: 'string',
            enum: extractStringEnumValues<ERC7579ModulesOptions>()(['AccountERC7579', 'AccountERC7579Hooked']),
          },
        ],
        description: solidityAccountDescriptions.ERC7579Modules,
      },
      access: {
        type: 'boolean',
        enum: [false],
        description: 'Access control is not available for an account contract. It always authorizes itself.',
      },
    },
    required: ['name'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'solidity', 'Account'>;

export const solidityGovernorAIFunctionDefinition = {
  name: 'Governor',
  description: solidityPrompts.Governor,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(commonFunctionDescription, ['name', 'upgradeable', 'info']),
      delay: {
        type: 'string',
        description: solidityGovernorDescriptions.delay,
      },
      period: {
        type: 'string',
        description: solidityGovernorDescriptions.period,
      },
      blockTime: {
        type: 'number',
        description: solidityGovernorDescriptions.blockTime,
      },
      proposalThreshold: {
        type: 'string',
        description: solidityGovernorDescriptions.proposalThreshold,
      },
      decimals: {
        type: 'number',
        description: solidityGovernorDescriptions.decimals,
      },
      quorumMode: {
        type: 'string',
        enum: enumValues<QuorumMode>()(['percent', 'absolute']),
        description: solidityGovernorDescriptions.quorumMode,
      },
      quorumPercent: {
        type: 'number',
        description: solidityGovernorDescriptions.quorumPercent,
      },
      quorumAbsolute: {
        type: 'string',
        description: solidityGovernorDescriptions.quorumAbsolute,
      },
      votes: {
        type: 'string',
        enum: enumValues<VotesOptions>()(['erc20votes', 'erc721votes']),
        description: solidityGovernorDescriptions.votes,
      },
      clockMode: {
        type: 'string',
        enum: enumValues<ClockMode>()(['blocknumber', 'timestamp']),
        description: solidityGovernorDescriptions.clockMode,
      },
      timelock: {
        anyOf: [
          { type: 'string', enum: extractStringEnumValues<TimelockOptions>()(['openzeppelin', 'compound']) },
          { type: 'boolean', enum: [false] },
        ],
        description: solidityGovernorDescriptions.timelock,
      },
      storage: {
        type: 'boolean',
        description: solidityGovernorDescriptions.storage,
      },
      settings: {
        type: 'boolean',
        description: solidityGovernorDescriptions.settings,
      },
      access: {
        type: 'boolean',
        enum: [false],
        description:
          'Access control is not available for a governor contract. Use the `onlyGovernance` modifier to control access to functions that should be restricted to governance.',
      },
    },
    required: ['name', 'delay', 'period'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'solidity', 'Governor'>;

export const solidityCustomAIFunctionDefinition = {
  name: 'Custom',
  description: solidityPrompts.Custom,
  parameters: {
    type: 'object',
    properties: addFunctionPropertiesFrom(commonFunctionDescription, [
      'name',
      'pausable',
      'access',
      'upgradeable',
      'info',
    ]),
    required: ['name'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'solidity', 'Custom'>;
