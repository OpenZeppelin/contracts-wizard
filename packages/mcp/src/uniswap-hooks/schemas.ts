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
    options: sharesOptionsSchema.describe(uniswapHooksSharesDescriptions.options),
    name: z.string().optional().describe(uniswapHooksSharesDescriptions.name),
    symbol: z.string().optional().describe(uniswapHooksSharesDescriptions.symbol),
    uri: z.string().optional().describe(uniswapHooksSharesDescriptions.uri),
  })
  .describe(uniswapHooksDescriptions.shares);

const permissionsSchema = z
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
    afterAddLiquidityReturnDelta: z
      .boolean()
      .describe(uniswapHooksPermissionDescriptions.afterAddLiquidityReturnDelta),
    afterRemoveLiquidityReturnDelta: z
      .boolean()
      .describe(uniswapHooksPermissionDescriptions.afterRemoveLiquidityReturnDelta),
  })
  .describe(uniswapHooksDescriptions.permissions);

const inputsSchema = z
  .object({
    blockNumberOffset: z.number().describe(uniswapHooksInputsDescriptions.blockNumberOffset),
    maxAbsTickDelta: z.number().describe(uniswapHooksInputsDescriptions.maxAbsTickDelta),
  })
  .describe(uniswapHooksDescriptions.inputs);

export const hooksSchema = {
  hook: z.enum([...hookNames] as [HookName, ...HookName[]]).describe(uniswapHooksDescriptions.hook),
  name: z.string().describe(commonDescriptions.name),
  pausable: z.boolean().describe(commonDescriptions.pausable),
  currencySettler: z.boolean().describe(uniswapHooksDescriptions.currencySettler),
  safeCast: z.boolean().describe(uniswapHooksDescriptions.safeCast),
  transientStorage: z.boolean().describe(uniswapHooksDescriptions.transientStorage),
  shares: sharesSchema,
  permissions: permissionsSchema,
  inputs: inputsSchema,
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
