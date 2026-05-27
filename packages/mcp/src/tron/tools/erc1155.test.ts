import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTronTRC1155 } from './erc1155';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { ERC1155Options } from '@openzeppelin/wizard';
import { erc1155, rewriteForTron } from '@openzeppelin/wizard';
import { solidityERC1155Schema } from '@openzeppelin/wizard-common/schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof solidityERC1155Schema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerTronTRC1155(new McpServer(testMcpInfo));
  t.context.schema = z.object(solidityERC1155Schema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<ERC1155Options> = params;
  t.pass();
}

const tronPrint = (opts: ERC1155Options) => rewriteForTron(erc1155.print(opts));

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'TestMulti',
    uri: 'ipfs://example/{id}',
  };
  await assertAPIEquivalence(t, params, tronPrint);
});

test('all', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestMulti',
    uri: 'ipfs://example/{id}',
    burnable: true,
    pausable: true,
    mintable: true,
    supply: true,
    updatableUri: true,
    access: 'roles',
    upgradeable: 'transparent',
    info: {
      license: 'MIT',
      securityContact: 'security@example.com',
    },
  };

  assertHasAllSupportedFields(t, params);

  await assertAPIEquivalence(t, params, tronPrint);
});
