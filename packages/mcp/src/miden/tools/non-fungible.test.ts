import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerMidenNonFungible } from './non-fungible';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { NonFungibleOptions } from '@openzeppelin/wizard-miden';
import { nonFungible } from '@openzeppelin/wizard-miden';
import { midenNonFungibleSchema } from '@openzeppelin/wizard-common/schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof midenNonFungibleSchema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerMidenNonFungible(new McpServer(testMcpInfo));
  t.context.schema = z.object(midenNonFungibleSchema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<NonFungibleOptions> = params;
  t.pass();
}

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'TestToken',
    symbol: 'TST',
  };
  await assertAPIEquivalence(t, params, nonFungible.print);
});

test('all', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestToken',
    symbol: 'TST',
    description: 'A test collection',
    logoUri: 'https://example.com/logo.png',
    contractUri: 'https://example.com/collection.json',
    updatableMetadata: true,
    burnable: false,
    pausable: true,
    restrictions: 'allowlist',
    switchablePolicies: true,
    access: 'ownable',
    info: {
      license: 'MIT',
      securityContact: 'security@example.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, nonFungible.print);
});

test('invalid options', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'TestToken',
    symbol: 'TST1',
    contractUri: 'x'.repeat(196),
  };
  await assertAPIEquivalence(t, params, nonFungible.print, true);
});
