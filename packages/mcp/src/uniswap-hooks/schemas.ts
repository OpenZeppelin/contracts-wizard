import { z } from 'zod';
import {
  commonDescriptions,
  infoDescriptions,
  uniswapHooksDescriptions,
  uniswapHooksSharesDescriptions,
  uniswapHooksPermissionDescriptions,
  uniswapHooksInputsDescriptions,
  solidityCommonDescriptions,
} from '@openzeppelin/wizard-common';
import { HooksNames, ShareOptions, type KindedOptions } from '@openzeppelin/wizard-uniswap-hooks';

/**
 * Static type assertions to ensure schemas satisfy the Wizard API types. Not called at runtime.
 */
function _typeAssertions() {
  const _assertions: {
    [K in keyof KindedOptions]: Omit<KindedOptions[K], 'kind'>;
  } = {
    Hooks: z.object(hooksSchema).parse({}),
  };
}

const hookEnum = z.enum(HooksNames);

const sharesOptionsSchema = z.union([z.literal(false), z.enum(ShareOptions)]);

export const commonSchema = {
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
    afterAddLiquidityReturnDelta: z.boolean().describe(uniswapHooksPermissionDescriptions.afterAddLiquidityReturnDelta),
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
  hook: hookEnum.describe(uniswapHooksDescriptions.hook),
  name: z.string().describe(commonDescriptions.name),
  pausable: z.boolean().describe(commonDescriptions.pausable),
  currencySettler: z.boolean().describe(uniswapHooksDescriptions.currencySettler),
  safeCast: z.boolean().describe(uniswapHooksDescriptions.safeCast),
  transientStorage: z.boolean().describe(uniswapHooksDescriptions.transientStorage),
  shares: sharesSchema,
  permissions: permissionsSchema,
  inputs: inputsSchema,
  ...commonSchema,
} as const satisfies z.ZodRawShape;
