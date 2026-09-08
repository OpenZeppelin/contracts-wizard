import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerMidenFungible } from './fungible';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { FungibleOptions } from '@openzeppelin/wizard-miden';
import { fungible } from '@openzeppelin/wizard-miden';
import { midenFungibleSchema } from '@openzeppelin/wizard-common/schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof midenFungibleSchema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerMidenFungible(new McpServer(testMcpInfo));
  t.context.schema = z.object(midenFungibleSchema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<FungibleOptions> = params;
  t.pass();
}

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'TestToken',
    symbol: 'TST',
  };
  await assertAPIEquivalence(t, params, fungible.print);
});

test('all', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestToken',
    symbol: 'TST',
    decimals: '6',
    maxSupply: '1000000',
    description: 'A test token',
    logoUri: 'https://example.com/logo.png',
    externalLink: 'https://example.com',
    updatableMetadata: true,
    updatableMaxSupply: true,
    burnable: true,
    minBurnAmount: '10',
    pausable: true,
    restrictions: 'blocklist',
    switchablePolicies: true,
    access: 'roles',
    info: {
      license: 'MIT',
      securityContact: 'security@example.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, fungible.print);
});

test('owner-only burning', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'TestToken',
    symbol: 'TST',
    burnable: false,
    access: 'ownable',
  };
  await assertAPIEquivalence(t, params, fungible.print);
});

test('invalid options', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'TestToken',
    symbol: 'tst',
    decimals: '13',
  };
  await assertAPIEquivalence(t, params, fungible.print, true);
});
