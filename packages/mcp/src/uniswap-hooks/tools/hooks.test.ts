import type { ExecutionContext, TestFn } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { hooks, type HooksOptions } from '@openzeppelin/wizard-uniswap-hooks';
import { z } from 'zod';

import { registerUniswapHooks } from './hooks';
import { assertAPIEquivalence, testMcpInfo, type DeepRequired } from '../../helpers.test';
import { hooksSchema } from '../schemas';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof hooksSchema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerUniswapHooks(new McpServer(testMcpInfo));
  t.context.schema = z.object(hooksSchema);
});

type SchemaParams = DeepRequired<z.infer<Context['schema']>>;

function assertHasAllSupportedFields(t: ExecutionContext<Context>, params: SchemaParams) {
  const _: DeepRequired<Omit<HooksOptions, 'access' | 'upgradeable'>> = params;
  t.pass();
}

test('basic hook configuration', async t => {
  const params: z.infer<Context['schema']> = {
    hook: 'BaseHook',
    name: 'TestHook',
    pausable: false,
    currencySettler: false,
    safeCast: false,
    transientStorage: false,
    shares: {
      options: false,
    },
    permissions: {
      beforeInitialize: false,
      afterInitialize: false,
      beforeAddLiquidity: false,
      beforeRemoveLiquidity: false,
      afterAddLiquidity: false,
      afterRemoveLiquidity: false,
      beforeSwap: false,
      afterSwap: false,
      beforeDonate: false,
      afterDonate: false,
      beforeSwapReturnDelta: false,
      afterSwapReturnDelta: false,
      afterAddLiquidityReturnDelta: false,
      afterRemoveLiquidityReturnDelta: false,
    },
    inputs: {
      blockNumberOffset: 10,
      maxAbsTickDelta: 1000,
    },
  };

  await assertAPIEquivalence(t, params, hooks.print);
});

test('all options engaged', async t => {
  const params: SchemaParams = {
    hook: 'OracleHookWithV3Adapters',
    name: 'FullFeaturedHook',
    pausable: true,
    currencySettler: true,
    safeCast: true,
    transientStorage: true,
    shares: {
      options: 'ERC6909',
      name: 'HookShares',
      symbol: 'HSH',
      uri: 'https://example.com/metadata.json',
    },
    permissions: {
      beforeInitialize: true,
      afterInitialize: true,
      beforeAddLiquidity: true,
      beforeRemoveLiquidity: true,
      afterAddLiquidity: true,
      afterRemoveLiquidity: true,
      beforeSwap: true,
      afterSwap: true,
      beforeDonate: true,
      afterDonate: true,
      beforeSwapReturnDelta: true,
      afterSwapReturnDelta: true,
      afterAddLiquidityReturnDelta: true,
      afterRemoveLiquidityReturnDelta: true,
    },
    inputs: {
      blockNumberOffset: 42,
      maxAbsTickDelta: 600000,
    },
    info: {
      securityContact: 'security@example.com',
      license: 'MIT',
    },
  };

  assertHasAllSupportedFields(t, params);

  await assertAPIEquivalence(t, params, hooks.print);
});

test('oracle hook with invalid maxAbsTickDelta', async t => {
  const params: z.infer<Context['schema']> = {
    hook: 'BaseOracleHook',
    name: 'InvalidOracleHook',
    pausable: false,
    currencySettler: false,
    safeCast: false,
    transientStorage: false,
    shares: {
      options: false,
    },
    permissions: {
      beforeInitialize: false,
      afterInitialize: false,
      beforeAddLiquidity: false,
      beforeRemoveLiquidity: false,
      afterAddLiquidity: false,
      afterRemoveLiquidity: false,
      beforeSwap: false,
      afterSwap: false,
      beforeDonate: false,
      afterDonate: false,
      beforeSwapReturnDelta: false,
      afterSwapReturnDelta: false,
      afterAddLiquidityReturnDelta: false,
      afterRemoveLiquidityReturnDelta: false,
    },
    inputs: {
      blockNumberOffset: 10,
      maxAbsTickDelta: 888000,
    },
  };

  await assertAPIEquivalence(t, params, hooks.print, true);
});

test('liquidity penalty hook with invalid blockNumberOffset', async t => {
  const params: z.infer<Context['schema']> = {
    hook: 'LiquidityPenaltyHook',
    name: 'InvalidLiquidityPenaltyHook',
    pausable: false,
    currencySettler: false,
    safeCast: false,
    transientStorage: false,
    shares: {
      options: false,
    },
    permissions: {
      beforeInitialize: false,
      afterInitialize: false,
      beforeAddLiquidity: false,
      beforeRemoveLiquidity: false,
      afterAddLiquidity: false,
      afterRemoveLiquidity: false,
      beforeSwap: false,
      afterSwap: false,
      beforeDonate: false,
      afterDonate: false,
      beforeSwapReturnDelta: false,
      afterSwapReturnDelta: false,
      afterAddLiquidityReturnDelta: false,
      afterRemoveLiquidityReturnDelta: false,
    },
    inputs: {
      blockNumberOffset: 0,
      maxAbsTickDelta: 5000,
    },
  };

  await assertAPIEquivalence(t, params, hooks.print, true);
});
