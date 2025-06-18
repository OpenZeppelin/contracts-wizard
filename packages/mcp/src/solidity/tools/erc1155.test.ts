import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityERC1155 } from './erc1155';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { ERC1155Options } from '@openzeppelin/wizard';
import { erc1155 } from '@openzeppelin/wizard';
import { erc1155Schema } from '../schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof erc1155Schema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerSolidityERC1155(new McpServer(testMcpInfo));
  t.context.schema = z.object(erc1155Schema);
});

function assertHasAllSupportedFields(t: ExecutionContext<Context>, params: Required<z.infer<typeof t.context.schema>>) {
  const _: Required<ERC1155Options> = params;
  t.pass();
}

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'MyTokens',
    uri: 'https://example.com/token/{id}.json',
  };
  await assertAPIEquivalence(t, params, erc1155.print);
});

test('all', async t => {
  const params: Required<z.infer<typeof t.context.schema>> = {
    name: 'MyTokens',
    uri: 'https://example.com/token/{id}.json',
    burnable: true,
    pausable: true,
    mintable: true,
    supply: true,
    updatableUri: true,
    access: 'roles',
    upgradeable: 'uups',
    info: {
      license: 'MIT',
      securityContact: 'security@example.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, erc1155.print);
});
