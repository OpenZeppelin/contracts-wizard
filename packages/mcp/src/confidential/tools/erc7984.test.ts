import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerConfidentialERC7984 } from './erc7984';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { ERC7984Options } from '@openzeppelin/wizard-confidential';
import { erc7984 } from '@openzeppelin/wizard-confidential';
import { erc7984Schema } from '../schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof erc7984Schema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerConfidentialERC7984(new McpServer(testMcpInfo));
  t.context.schema = z.object(erc7984Schema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<ERC7984Options> = params;
  t.pass();
}

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'TestToken',
    symbol: 'TST',
    contractURI: 'https://example.com',
    networkConfig: 'zama-ethereum',
  };
  await assertAPIEquivalence(t, params, erc7984.print);
});

test('all', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestToken',
    symbol: 'TST',
    contractURI: 'https://example.com',
    premint: '1000',
    networkConfig: 'zama-ethereum',
    wrappable: true,
    votes: 'blocknumber',
    info: {
      license: 'MIT',
      securityContact: 'security@example.com',
    },
  };

  assertHasAllSupportedFields(t, params);

  await assertAPIEquivalence(t, params, erc7984.print);
});
