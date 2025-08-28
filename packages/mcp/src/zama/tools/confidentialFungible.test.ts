import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerZamaConfidentialFungible } from './confidentialFungible';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { ConfidentialFungibleOptions } from '@openzeppelin/wizard-zama';
import { confidentialFungible } from '@openzeppelin/wizard-zama';
import { confidentialFungibleSchema } from '../schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof confidentialFungibleSchema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerZamaConfidentialFungible(new McpServer(testMcpInfo));
  t.context.schema = z.object(confidentialFungibleSchema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<ConfidentialFungibleOptions> = params;
  t.pass();
}

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'TestToken',
    symbol: 'TST',
    tokenURI: 'https://example.com',
    networkConfig: 'zama-sepolia',
  };
  await assertAPIEquivalence(t, params, confidentialFungible.print);
});

test('all', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestToken',
    symbol: 'TST',
    tokenURI: 'https://example.com',
    premint: '1000',
    networkConfig: 'zama-sepolia',
    wrappable: true,
    votes: 'blocknumber',
    info: {
      license: 'MIT',
      securityContact: 'security@example.com',
    },
  };

  assertHasAllSupportedFields(t, params);

  await assertAPIEquivalence(t, params, confidentialFungible.print);
});
