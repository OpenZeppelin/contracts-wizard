import { z } from 'zod';
import {
  commonDescriptions,
  infoDescriptions,
  uniswapHooksDescriptions,
  uniswapHooksSharesDescriptions,
  uniswapHooksPermissionDescriptions,
  uniswapHooksInputsDescriptions,
  solidityCommonDescriptions,
} from '../../index';

export const uniswapHooksCommonSchema = {
  access: z
    .literal('ownable')
    .or(z.literal('roles'))
    .or(z.literal('managed'))
    .optional()
    .describe(solidityCommonDescriptions.access),
  info: z
    .object({
      securityContact: z.string().optional().describe(infoDescriptions.securityContact),
      license: z.string().optional().describe(infoDescriptions.license),
    })
    .optional()
    .describe(infoDescriptions.info),
} as const satisfies z.ZodRawShape;

export const uniswapHooksSharesSchema = z
  .object({
    options: z
      .union([z.literal(false), z.literal('ERC20'), z.literal('ERC1155'), z.literal('ERC6909')])
      .describe(uniswapHooksSharesDescriptions.options),
    name: z.string().optional().describe(uniswapHooksSharesDescriptions.name),
    symbol: z.string().optional().describe(uniswapHooksSharesDescriptions.symbol),
    uri: z.string().optional().describe(uniswapHooksSharesDescriptions.uri),
  })
  .describe(uniswapHooksDescriptions.shares);

export const uniswapHooksPermissionsSchema = z
  .object({
    beforeInitialize: z.boolean().describe(uniswapHooksPermissionDescriptions.beforeInitialize),
    afterInitialize: z.boolean().describe(uniswapHooksPermissionDescriptions.afterInitialize),
    beforeAddLiquidity: z.boolean().describe(uniswapHooksPermissionDescriptions.beforeAddLiquidity),
    beforeRemoveLiquidity: z.boolean().describe(uniswapHooksPermissionDescriptions.beforeRemoveLiquidity),
    afterAddLiquidity: z.boolean().describe(uniswapHooksPermissionDescriptions.afterAddLiquidity),
    afterRemoveLiquidity: z.boolean().describe(uniswapHooksPermissionDescriptions.afterRemoveLiquidity),
    beforeSwap: z.boolean().describe(uniswapHooksPermissionDescriptions.beforeSwap),
    afterSwap: z.boolean().describe(uniswapHooksPermissionDescriptions.afterSwap),
    beforeDonate: z.boolean().describe(uniswapHooksPermissionDescriptions.beforeDonate),
    afterDonate: z.boolean().describe(uniswapHooksPermissionDescriptions.afterDonate),
    beforeSwapReturnDelta: z.boolean().describe(uniswapHooksPermissionDescriptions.beforeSwapReturnDelta),
    afterSwapReturnDelta: z.boolean().describe(uniswapHooksPermissionDescriptions.afterSwapReturnDelta),
    afterAddLiquidityReturnDelta: z.boolean().describe(uniswapHooksPermissionDescriptions.afterAddLiquidityReturnDelta),
    afterRemoveLiquidityReturnDelta: z
      .boolean()
      .describe(uniswapHooksPermissionDescriptions.afterRemoveLiquidityReturnDelta),
  })
  .describe(uniswapHooksDescriptions.permissions);

export const uniswapHooksInputsSchema = z
  .object({
    blockNumberOffset: z.number().describe(uniswapHooksInputsDescriptions.blockNumberOffset),
    maxAbsTickDelta: z.number().describe(uniswapHooksInputsDescriptions.maxAbsTickDelta),
  })
  .describe(uniswapHooksDescriptions.inputs);

export const uniswapHooksHooksSchema = {
  hook: z
    .enum([
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
    ])
    .describe(uniswapHooksDescriptions.hook),
  name: z.string().describe(commonDescriptions.name),
  pausable: z.boolean().describe(commonDescriptions.pausable),
  currencySettler: z.boolean().describe(uniswapHooksDescriptions.currencySettler),
  safeCast: z.boolean().describe(uniswapHooksDescriptions.safeCast),
  transientStorage: z.boolean().describe(uniswapHooksDescriptions.transientStorage),
  shares: uniswapHooksSharesSchema,
  permissions: uniswapHooksPermissionsSchema,
  inputs: uniswapHooksInputsSchema,
  ...uniswapHooksCommonSchema,
} as const satisfies z.ZodRawShape;
