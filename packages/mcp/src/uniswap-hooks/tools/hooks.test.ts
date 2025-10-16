import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { HooksOptions } from '@openzeppelin/wizard-uniswap-hooks';
import { hooks } from '@openzeppelin/wizard-uniswap-hooks';
import { hooksSchema } from '../schemas';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import { z } from 'zod';
import { registerUniswapHooks } from './hooks';

const hooksZodObject = z.object(hooksSchema);
type HooksSchemaInput = z.infer<typeof hooksZodObject>;

interface Context {
  tool: RegisteredTool;
  schema: typeof hooksZodObject;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerUniswapHooks(new McpServer(testMcpInfo));
  t.context.schema = hooksZodObject;
});

function assertHasAllSupportedFields(t: ExecutionContext<Context>, params: DeepRequired<HooksSchemaInput>) {
  const defaults = hooks.defaults;
  const options: DeepRequired<HooksOptions> = {
    ...defaults,
    ...params,
    shares: {
      ...defaults.shares,
      ...params.shares,
    },
    permissions: {
      ...defaults.permissions,
      ...params.permissions,
    },
    inputs: {
      ...defaults.inputs,
      ...params.inputs,
    },
    access: params.access ?? defaults.access,
    upgradeable: params.upgradeable ?? defaults.upgradeable,
    info: params.info ?? defaults.info,
  };
  void options;
  t.pass();
}

function mergeWithDefaults(options: HooksSchemaInput): HooksOptions {
  const defaults = hooks.defaults;

  return {
    ...defaults,
    hook: options.hook ?? defaults.hook,
    name: options.name ?? defaults.name,
    pausable: options.pausable ?? defaults.pausable,
    currencySettler: options.currencySettler ?? defaults.currencySettler,
    safeCast: options.safeCast ?? defaults.safeCast,
    transientStorage: options.transientStorage ?? defaults.transientStorage,
    shares: {
      ...defaults.shares,
      ...(options.shares ?? {}),
    },
    permissions: {
      ...defaults.permissions,
      ...(options.permissions ?? {}),
    },
    inputs: {
      ...defaults.inputs,
      ...(options.inputs ?? {}),
    },
    access: options.access ?? defaults.access,
    upgradeable: options.upgradeable ?? defaults.upgradeable,
    info: options.info ?? defaults.info,
  };
}

test('all', async t => {
  const params: DeepRequired<HooksSchemaInput> = {
    hook: 'OracleHookWithV3Adapters',
    name: 'AdvancedHook',
    pausable: true,
    currencySettler: true,
    safeCast: true,
    transientStorage: true,
    shares: {
      options: 'ERC1155',
      name: 'AdvancedShares',
      symbol: 'ASH',
      uri: 'https://example.com/{id}.json',
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
      blockNumberOffset: 12,
      maxAbsTickDelta: 123456,
    },
    access: 'roles',
    upgradeable: 'uups',
    info: {
      license: 'MIT',
      securityContact: 'security@example.com',
    },
  };

  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, options => hooks.print(mergeWithDefaults(options)));
});
