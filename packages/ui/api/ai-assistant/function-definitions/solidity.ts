import type { AiFunctionDefinition } from '../types/function-definition.ts';
import { addFunctionPropertiesFrom } from './shared.ts';
import { commonFunctionDescription } from './solidity-shared.ts';

export const solidityERC20AIFunctionDefinition = {
  name: 'ERC20',
  description: 'Make a fungible token per the ERC-20 standard',
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
        description: 'The number of tokens to premint for the deployer.',
      },
      permit: {
        type: 'boolean',
        description:
          'Whether without paying gas, token holders will be able to allow third parties to transfer from their account.',
      },
      votes: {
        anyOf: [
          { type: 'boolean', enum: [false, true] },
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
      premintChainId: {
        type: 'string',
        description: 'The chain ID of the network on which to premint tokens.',
      },
      callback: {
        type: 'boolean',
        description:
          'Whether to include support for code execution after transfers and approvals on recipient contracts in a single transaction.',
      },
    },
    required: ['name', 'symbol'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'solidity', 'ERC20'>;

export const solidityERC721AIFunctionDefinition = {
  name: 'ERC721',
  description: 'Make a non-fungible token per the ERC-721 standard',
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
          'Whether to keep track of individual units for voting in on-chain governance. Voting durations can be expressed as block numbers or timestamps (defaulting to block number if not specified).',
      },
    },
    required: ['name', 'symbol'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'solidity', 'ERC721'>;

export const solidityERC1155AIFunctionDefinition = {
  name: 'ERC1155',
  description: 'Make a non-fungible token per the ERC-1155 standard',
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
        description:
          'The location of the metadata for the token. Clients will replace any instance of {id} in this string with the tokenId.',
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
} as const satisfies AiFunctionDefinition<'solidity', 'ERC1155'>;

export const solidityStablecoinAIFunctionDefinition = {
  name: 'Stablecoin',
  description:
    'Make a stablecoin token that uses the ERC-20 standard. Emphasize that this is experimental, and some features are not audited and subject to change.',
  parameters: {
    type: 'object',
    properties: {
      ...solidityERC20AIFunctionDefinition.parameters.properties,
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
} as const satisfies AiFunctionDefinition<'solidity', 'Stablecoin'>;

export const solidityRealWorldAssetAIFunctionDefinition = {
  name: 'RealWorldAsset',
  description:
    'Make a real-world asset token that uses the ERC-20 standard. Emphasize that this is experimental, and some features are not audited and subject to change.',
  parameters: solidityStablecoinAIFunctionDefinition.parameters,
} as const satisfies AiFunctionDefinition<'solidity', 'RealWorldAsset'>;

export const solidityAccountAIFunctionDefinition = {
  name: 'Account',
  description:
    'Make an account contract that follows the ERC-4337 standard. Emphasize that this is experimental, and some features are not audited and subject to change.',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(commonFunctionDescription, ['name', 'info']),
      signatureValidation: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: ['ERC1271', 'ERC7739'] },
        ],
        description:
          'Whether to implement the ERC-1271 standard for validating signatures. This is useful for the account to verify signatures.',
      },
      ERC721Holder: {
        type: 'boolean',
        description:
          'Whether to implement the `onERC721Received` function to allow the account to receive ERC721 tokens.',
      },
      ERC1155Holder: {
        type: 'boolean',
        description:
          'Whether to implement the `onERC1155Received` function to allow the account to receive ERC1155 tokens.',
      },
      signer: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: ['ECDSA', 'ERC7702', 'P256', 'RSA', 'Multisig', 'MultisigWeighted'] },
        ],
        description: `Defines the signature verification algorithm used by the account to verify user operations. Options:
        - ECDSA: Standard Ethereum signature validation using secp256k1, validates signatures against a specified owner address
        - ERC7702: Special ECDSA validation using account's own address as signer, enables EOAs to delegate execution rights
        - P256: NIST P-256 curve (secp256r1) validation for integration with Passkeys and HSMs
        - RSA: RSA PKCS#1 v1.5 signature validation (RFC8017) for PKI systems and HSMs
        - Multisig: ERC-7913 multisignature requiring minimum number of signatures from authorized signers
        - MultisigWeighted: ERC-7913 weighted multisignature where signers have different voting weights`,
      },
      batchedExecution: {
        type: 'boolean',
        description:
          'Whether to implement a minimal batching interface for the account to allow multiple operations to be executed in a single transaction following the ERC-7821 standard.',
      },
      ERC7579Modules: {
        anyOf: [
          { type: 'boolean', enum: [false] },
          { type: 'string', enum: ['AccountERC7579', 'AccountERC7579Hooked'] },
        ],
        description:
          'Whether to implement the ERC-7579 compatibility to enable functionality on the account with modules.',
      },
      upgradeable: {
        type: 'boolean',
        enum: [false],
        description: 'Upgradeability is not yet available for features that use @openzeppelin/community-contracts',
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
  description: 'Make a contract to implement governance, such as for a DAO',
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(commonFunctionDescription, ['name', 'access', 'upgradeable', 'info']),
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
        type: 'string',
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
        type: 'string',
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
          { type: 'string', enum: ['openzeppelin', 'compound'] },
          { type: 'boolean', enum: [false] },
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
} as const satisfies AiFunctionDefinition<'solidity', 'Governor'>;

export const solidityCustomAIFunctionDefinition = {
  name: 'Custom',
  description: 'Make a custom smart contract',
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
