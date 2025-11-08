import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStellarNonFungible } from './non-fungible';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { NonFungibleOptions } from '@openzeppelin/wizard-stellar';
import { nonFungible } from '@openzeppelin/wizard-stellar';
import { nonFungibleSchema } from '../schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof nonFungibleSchema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerStellarNonFungible(new McpServer(testMcpInfo));
  t.context.schema = z.object(nonFungibleSchema);
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
    baseUri: 'www.testtoken.com',
  };
  await assertAPIEquivalence(t, params, nonFungible.print);
});

test('all', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestToken',
    symbol: 'TST',
    baseUri: 'www.testtoken.com',
    burnable: true,
    enumerable: true,
    consecutive: true,
    pausable: true,
    upgradeable: true,
    mintable: true,
    sequential: true,
    access: 'ownable',
    info: {
      license: 'MIT',
      securityContact: 'security@contact.com',
    },
  };
  assertHasAllSupportedFields(t, params);

  // Records an error in the snapshot, because some fields are incompatible with each other.
  // This is ok, because we just need to check that all fields can be passed in.
  await assertAPIEquivalence(t, params, nonFungible.print, true);
});
