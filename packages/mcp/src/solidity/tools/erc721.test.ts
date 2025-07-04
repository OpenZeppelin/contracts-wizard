import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityERC721 } from './erc721';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { ERC721Options } from '@openzeppelin/wizard';
import { erc721 } from '@openzeppelin/wizard';
import { erc721Schema } from '../schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof erc721Schema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerSolidityERC721(new McpServer(testMcpInfo));
  t.context.schema = z.object(erc721Schema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<ERC721Options> = params;
  t.pass();
}

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'MyNFT',
    symbol: 'NFT',
  };
  await assertAPIEquivalence(t, params, erc721.print);
});

test('all', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'MyNFT',
    symbol: 'NFT',
    baseUri: 'https://example.com/nft/',
    enumerable: true,
    uriStorage: true,
    burnable: true,
    pausable: true,
    mintable: true,
    incremental: true,
    votes: 'blocknumber',
    access: 'roles',
    upgradeable: 'uups',
    info: {
      license: 'MIT',
      securityContact: 'security@example.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, erc721.print);
});
