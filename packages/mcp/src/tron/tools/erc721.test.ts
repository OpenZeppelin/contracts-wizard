import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTronTRC721 } from './erc721';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { ERC721Options } from '@openzeppelin/wizard';
import { erc721, rewriteForTron } from '@openzeppelin/wizard';
import { solidityERC721Schema } from '@openzeppelin/wizard-common/schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof solidityERC721Schema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerTronTRC721(new McpServer(testMcpInfo));
  t.context.schema = z.object(solidityERC721Schema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<ERC721Options> = params;
  t.pass();
}

const tronPrint = (opts: ERC721Options) => rewriteForTron(erc721.print(opts));

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'TestNFT',
    symbol: 'TNFT',
  };
  await assertAPIEquivalence(t, params, tronPrint);
});

test('all', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestNFT',
    symbol: 'TNFT',
    baseUri: 'https://example.com/',
    enumerable: true,
    uriStorage: true,
    burnable: true,
    pausable: true,
    mintable: true,
    incremental: true,
    votes: 'blocknumber',
    access: 'roles',
    upgradeable: 'transparent',
    namespacePrefix: 'myProject',
    info: {
      license: 'MIT',
      securityContact: 'security@example.com',
    },
  };

  assertHasAllSupportedFields(t, params);

  await assertAPIEquivalence(t, params, tronPrint);
});
