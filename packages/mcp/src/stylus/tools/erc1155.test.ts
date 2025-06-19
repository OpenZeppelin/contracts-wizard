import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStylusERC1155 } from './erc1155';
import { testMcpInfo, assertAPIEquivalence, DeepRequired } from '../../helpers.test';
import type { ERC1155Options } from '@openzeppelin/wizard-stylus';
import { erc1155 } from '@openzeppelin/wizard-stylus';
import { erc1155Schema } from '../schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof erc1155Schema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerStylusERC1155(new McpServer(testMcpInfo));
  t.context.schema = z.object(erc1155Schema);
});

function assertHasAllSupportedFields(t: ExecutionContext<Context>, params: DeepRequired<z.infer<typeof t.context.schema>>) {
  const _: DeepRequired<Omit<ERC1155Options, 'access'>> = params;
  t.pass();
}

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'TestToken',
  };
  await assertAPIEquivalence(t, params, erc1155.print);
});

test('all', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestToken',
    burnable: true,
    supply: true,
    info: {
      license: 'MIT',
      securityContact: 'security@example.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, erc1155.print);
});
