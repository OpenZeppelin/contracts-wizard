import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStellarFungible } from './fungible';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { FungibleOptions } from '@openzeppelin/wizard-stellar';
import { fungible } from '@openzeppelin/wizard-stellar';
import { fungibleSchema } from '../schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof fungibleSchema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerStellarFungible(new McpServer(testMcpInfo));
  t.context.schema = z.object(fungibleSchema);
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

test('all explicit', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestToken',
    symbol: 'TST',
    burnable: true,
    pausable: true,
    premint: '1000000',
    mintable: true,
    upgradeable: true,
    explicitImplementations: true,
    access: 'ownable',
    info: {
      license: 'MIT',
      securityContact: 'security@contact.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, fungible.print);
});

test('all default', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestToken',
    symbol: 'TST',
    burnable: true,
    pausable: true,
    premint: '1000000',
    mintable: true,
    upgradeable: true,
    access: 'ownable',
    explicitImplementations: false,
    info: {
      license: 'MIT',
      securityContact: 'security@contact.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, fungible.print);
});
