import type { AiFunctionDefinition } from '../types/function-definition.ts';
import { addFunctionPropertiesFrom, sharedFunctionDescription } from './shared.ts';
import {
  uniswapHooksPrompts,
  uniswapHooksDescriptions,
  uniswapHooksSharesDescriptions,
  uniswapHooksPermissionDescriptions,
  uniswapHooksInputsDescriptions,
} from '../../../../common/src/ai/descriptions/uniswap-hooks.ts';

export const uniswapHooksHooksAIFunctionDefinition = {
  name: 'Hooks',
  description: uniswapHooksPrompts.Hooks,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(sharedFunctionDescription, ['name', 'pausable']),
      hook: {
        type: 'string',
        enum: [
          'BaseHook',
          'BaseAsyncSwap',
          'BaseCustomAccounting',
          'BaseCustomCurve',
          'BaseDynamicFee',
          'BaseOverrideFee',
          'BaseDynamicAfterFee',
          'BaseHookFee',
          'AntiSandwichHook',
          'LiquidityPenaltyHook',
          'LimitOrderHook',
          'ReHypothecationHook',
          'BaseOracleHook',
          'OracleHookWithV3Adapters',
        ],
        description: uniswapHooksDescriptions.hook,
      },
      currencySettler: {
        type: 'boolean',
        description: uniswapHooksDescriptions.currencySettler,
      },
      safeCast: {
        type: 'boolean',
        description: uniswapHooksDescriptions.safeCast,
      },
      transientStorage: {
        type: 'boolean',
        description: uniswapHooksDescriptions.transientStorage,
      },
      shares: {
        type: 'object',
        description: uniswapHooksDescriptions.shares,
        properties: {
          options: {
            anyOf: [
              { type: 'boolean', enum: [false] },
              { type: 'string', enum: ['ERC20', 'ERC6909', 'ERC1155'] },
            ],
            description: uniswapHooksSharesDescriptions.options,
          },
          name: {
            type: 'string',
            description: uniswapHooksSharesDescriptions.name,
          },
          symbol: {
            type: 'string',
            description: uniswapHooksSharesDescriptions.symbol,
          },
          uri: {
            type: 'string',
            description: uniswapHooksSharesDescriptions.uri,
          },
        },
      },
      permissions: {
        type: 'object',
        description: uniswapHooksDescriptions.permissions,
        properties: {
          beforeInitialize: {
            type: 'boolean',
            description: uniswapHooksPermissionDescriptions.beforeInitialize,
          },
          afterInitialize: {
            type: 'boolean',
            description: uniswapHooksPermissionDescriptions.afterInitialize,
          },
          beforeAddLiquidity: {
            type: 'boolean',
            description: uniswapHooksPermissionDescriptions.beforeAddLiquidity,
          },
          afterAddLiquidity: {
            type: 'boolean',
            description: uniswapHooksPermissionDescriptions.afterAddLiquidity,
          },
          beforeRemoveLiquidity: {
            type: 'boolean',
            description: uniswapHooksPermissionDescriptions.beforeRemoveLiquidity,
          },
          afterRemoveLiquidity: {
            type: 'boolean',
            description: uniswapHooksPermissionDescriptions.afterRemoveLiquidity,
          },
          beforeSwap: {
            type: 'boolean',
            description: uniswapHooksPermissionDescriptions.beforeSwap,
          },
          afterSwap: {
            type: 'boolean',
            description: uniswapHooksPermissionDescriptions.afterSwap,
          },
          beforeDonate: {
            type: 'boolean',
            description: uniswapHooksPermissionDescriptions.beforeDonate,
          },
          afterDonate: {
            type: 'boolean',
            description: uniswapHooksPermissionDescriptions.afterDonate,
          },
          beforeSwapReturnDelta: {
            type: 'boolean',
            description: uniswapHooksPermissionDescriptions.beforeSwapReturnDelta,
          },
          afterSwapReturnDelta: {
            type: 'boolean',
            description: uniswapHooksPermissionDescriptions.afterSwapReturnDelta,
          },
          afterAddLiquidityReturnDelta: {
            type: 'boolean',
            description: uniswapHooksPermissionDescriptions.afterAddLiquidityReturnDelta,
          },
          afterRemoveLiquidityReturnDelta: {
            type: 'boolean',
            description: uniswapHooksPermissionDescriptions.afterRemoveLiquidityReturnDelta,
          },
        },
      },
      inputs: {
        type: 'object',
        description: uniswapHooksDescriptions.inputs,
        properties: {
          blockNumberOffset: {
            type: 'number',
            description: uniswapHooksInputsDescriptions.blockNumberOffset,
          },
          maxAbsTickDelta: {
            type: 'number',
            description: uniswapHooksInputsDescriptions.maxAbsTickDelta,
          },
        },
      },
    },
    required: [
      'name',
      'hook',
      'pausable',
      'currencySettler',
      'safeCast',
      'transientStorage',
      'shares',
      'permissions',
      'inputs',
    ],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'uniswapHooks', 'Hooks'>;
