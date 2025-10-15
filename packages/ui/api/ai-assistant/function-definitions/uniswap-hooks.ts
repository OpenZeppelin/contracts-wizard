import type { AiFunctionDefinition } from '../types/function-definition.ts';
import { addFunctionPropertiesFrom, sharedFunctionDescription } from './shared.ts';
import {
  uniswapHooksPrompts,
  uniswapHooksDescriptions,
  uniswapHooksSharesDescriptions,
  uniswapHooksPermissionDescriptions,
  uniswapHooksInputsDescriptions,
} from '../../../../common/src/ai/descriptions/uniswap-hooks.ts';
import type { HooksName } from '../../../../core/uniswap-hooks/dist';

export const uniswapHooksHooksAIFunctionDefinition = {
  name: 'Hooks',
  description: uniswapHooksPrompts.Hooks,
  parameters: {
    type: 'object',
    properties: {
      ...addFunctionPropertiesFrom(sharedFunctionDescription, ['name', 'pausable', 'access', 'upgradeable', 'info']),
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
        ] satisfies HooksName[],
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
            type: 'string',
            description: uniswapHooksPermissionDescriptions.beforeInitialize,
          },
          afterInitialize: {
            type: 'string',
            description: uniswapHooksPermissionDescriptions.afterInitialize,
          },
          beforeAddLiquidity: {
            type: 'string',
            description: uniswapHooksPermissionDescriptions.beforeAddLiquidity,
          },
          afterAddLiquidity: {
            type: 'string',
            description: uniswapHooksPermissionDescriptions.afterAddLiquidity,
          },
          beforeRemoveLiquidity: {
            type: 'string',
            description: uniswapHooksPermissionDescriptions.beforeRemoveLiquidity,
          },
          afterRemoveLiquidity: {
            type: 'string',
            description: uniswapHooksPermissionDescriptions.afterRemoveLiquidity,
          },
          beforeSwap: {
            type: 'string',
            description: uniswapHooksPermissionDescriptions.beforeSwap,
          },
          afterSwap: {
            type: 'string',
            description: uniswapHooksPermissionDescriptions.afterSwap,
          },
          beforeDonate: {
            type: 'string',
            description: uniswapHooksPermissionDescriptions.beforeDonate,
          },
          afterDonate: {
            type: 'string',
            description: uniswapHooksPermissionDescriptions.afterDonate,
          },
          beforeSwapReturnDelta: {
            type: 'string',
            description: uniswapHooksPermissionDescriptions.beforeSwapReturnDelta,
          },
          afterSwapReturnDelta: {
            type: 'string',
            description: uniswapHooksPermissionDescriptions.afterSwapReturnDelta,
          },
          afterAddLiquidityReturnDelta: {
            type: 'string',
            description: uniswapHooksPermissionDescriptions.afterAddLiquidityReturnDelta,
          },
          afterRemoveLiquidityReturnDelta: {
            type: 'string',
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
    required: ['name', 'hook'],
    additionalProperties: false,
  },
} as const satisfies AiFunctionDefinition<'uniswapHooks', 'Hooks'>;
