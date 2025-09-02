import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCairoERC20 } from './erc20';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { ERC20Options } from '@openzeppelin/wizard-cairo';
import { erc20 } from '@openzeppelin/wizard-cairo';
import { erc20Schema } from '../schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof erc20Schema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerCairoERC20(new McpServer(testMcpInfo));
  t.context.schema = z.object(erc20Schema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<ERC20Options> = params;
  t.pass();
}

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'MyToken',
    symbol: 'MTK',
    decimals: '18',
  };
  await assertAPIEquivalence(t, params, erc20.print);
});

test('all', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'MyToken',
    symbol: 'MTK',
    decimals: '18',
    burnable: true,
    pausable: true,
    premint: '1000000',
    mintable: true,
    votes: true,
    appName: 'MyToken',
    appVersion: 'v1',
    access: 'roles',
    upgradeable: true,
    info: {
      license: 'MIT',
      securityContact: 'security@example.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, erc20.print);
});
