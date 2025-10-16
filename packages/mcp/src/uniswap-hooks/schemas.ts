import { z } from 'zod';
import {
  commonDescriptions,
  infoDescriptions,
  solidityCommonDescriptions,
  uniswapHooksDescriptions,
  uniswapHooksSharesDescriptions,
  uniswapHooksPermissionDescriptions,
  uniswapHooksInputsDescriptions,
} from '@openzeppelin/wizard-common';
import type { HooksOptions, HookName, Permission } from '@openzeppelin/wizard-uniswap-hooks';
import { commonSchema } from '../solidity/schemas';

const hookNames = [
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
] as const satisfies readonly HookName[];

/**
 * Static type assertions to ensure schemas satisfy the Wizard API types. Not called at runtime.
 */
function _typeAssertions() {
  type _HookNameCoverage = HookName extends HookName[number] ? true : never;
  type _PermissionCoverage = Permission extends Permission[number] ? true : never;

  const _hookNameCoverage: _HookNameCoverage = true;
  const _permissionCoverage: _PermissionCoverage = true;

  void _hookNameCoverage;
  void _permissionCoverage;

  const _options: HooksOptions = {} as HooksOptions;
  void _options;
}

const sharesOptionsSchema = z.literal(false).or(z.literal('ERC20')).or(z.literal('ERC6909')).or(z.literal('ERC1155'));

const sharesSchema = z
  .object({
    options: sharesOptionsSchema.optional().describe(uniswapHooksSharesDescriptions.options),
    name: z.string().optional().describe(uniswapHooksSharesDescriptions.name),
    symbol: z.string().optional().describe(uniswapHooksSharesDescriptions.symbol),
    uri: z.string().optional().describe(uniswapHooksSharesDescriptions.uri),
  })
  .describe(uniswapHooksDescriptions.shares);

const permissionsSchema = z
  .object({
    beforeInitialize: z.boolean().optional().describe(uniswapHooksPermissionDescriptions.beforeInitialize),
    afterInitialize: z.boolean().optional().describe(uniswapHooksPermissionDescriptions.afterInitialize),
    beforeAddLiquidity: z.boolean().optional().describe(uniswapHooksPermissionDescriptions.beforeAddLiquidity),
    beforeRemoveLiquidity: z.boolean().optional().describe(uniswapHooksPermissionDescriptions.beforeRemoveLiquidity),
    afterAddLiquidity: z.boolean().optional().describe(uniswapHooksPermissionDescriptions.afterAddLiquidity),
    afterRemoveLiquidity: z.boolean().optional().describe(uniswapHooksPermissionDescriptions.afterRemoveLiquidity),
    beforeSwap: z.boolean().optional().describe(uniswapHooksPermissionDescriptions.beforeSwap),
    afterSwap: z.boolean().optional().describe(uniswapHooksPermissionDescriptions.afterSwap),
    beforeDonate: z.boolean().optional().describe(uniswapHooksPermissionDescriptions.beforeDonate),
    afterDonate: z.boolean().optional().describe(uniswapHooksPermissionDescriptions.afterDonate),
    beforeSwapReturnDelta: z.boolean().optional().describe(uniswapHooksPermissionDescriptions.beforeSwapReturnDelta),
    afterSwapReturnDelta: z.boolean().optional().describe(uniswapHooksPermissionDescriptions.afterSwapReturnDelta),
    afterAddLiquidityReturnDelta: z
      .boolean()
      .optional()
      .describe(uniswapHooksPermissionDescriptions.afterAddLiquidityReturnDelta),
    afterRemoveLiquidityReturnDelta: z
      .boolean()
      .optional()
      .describe(uniswapHooksPermissionDescriptions.afterRemoveLiquidityReturnDelta),
  })
  .describe(uniswapHooksDescriptions.permissions);

const inputsSchema = z
  .object({
    blockNumberOffset: z.number().optional().describe(uniswapHooksInputsDescriptions.blockNumberOffset),
    maxAbsTickDelta: z.number().optional().describe(uniswapHooksInputsDescriptions.maxAbsTickDelta),
  })
  .describe(uniswapHooksDescriptions.inputs);

export const hooksSchema = {
  hook: z.enum([...hookNames] as [HookName, ...HookName[]]).describe(uniswapHooksDescriptions.hook),
  name: z.string().describe(commonDescriptions.name),
  pausable: z.boolean().optional().describe(commonDescriptions.pausable),
  currencySettler: z.boolean().optional().describe(uniswapHooksDescriptions.currencySettler),
  safeCast: z.boolean().optional().describe(uniswapHooksDescriptions.safeCast),
  transientStorage: z.boolean().optional().describe(uniswapHooksDescriptions.transientStorage),
  shares: sharesSchema.optional(),
  permissions: permissionsSchema.optional(),
  inputs: inputsSchema.optional(),
  access: commonSchema.access,
  upgradeable: commonSchema.upgradeable.describe(solidityCommonDescriptions.upgradeable),
  info: z
    .object({
      securityContact: z.string().optional().describe(infoDescriptions.securityContact),
      license: z.string().optional().describe(infoDescriptions.license),
    })
    .optional()
    .describe(infoDescriptions.info),
} as const satisfies z.ZodRawShape;
