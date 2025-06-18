import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCairoAccount } from './account';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { AccountOptions } from '@openzeppelin/wizard-cairo';
import { account } from '@openzeppelin/wizard-cairo';
import { accountSchema } from '../schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof accountSchema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerCairoAccount(new McpServer(testMcpInfo));
  t.context.schema = z.object(accountSchema);
});

function assertHasAllSupportedFields(t: ExecutionContext<Context>, params: Required<z.infer<typeof t.context.schema>>) {
  const _: Required<AccountOptions> = params;
  t.pass();
}

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'MyAccount',
    type: 'eth',
  };
  await assertAPIEquivalence(t, params, account.print);
});

test('all', async t => {
  const params: Required<z.infer<typeof t.context.schema>> = {
    name: 'MyAccount',
    type: 'stark',
    declare: true,
    deploy: true,
    pubkey: true,
    outsideExecution: true,
    upgradeable: true,
    info: {
      license: 'MIT',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, account.print);
});
