import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStylusERC20 } from './erc20';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { ERC20Options } from '@openzeppelin/wizard-stylus';
import { erc20 } from '@openzeppelin/wizard-stylus';
import { erc20Schema } from '../schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof erc20Schema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerStylusERC20(new McpServer(testMcpInfo));
  t.context.schema = z.object(erc20Schema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<Omit<ERC20Options, 'access'>> = params;
  t.pass();
}

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'TestToken',
  };
  await assertAPIEquivalence(t, params, erc20.print);
});

test('all', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestToken',
    burnable: true,
    permit: true,
    flashmint: true,
    info: {
      license: 'MIT',
      securityContact: 'security@example.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, erc20.print);
});
