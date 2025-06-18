import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCairoERC721 } from './erc721';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { ERC721Options } from '@openzeppelin/wizard-cairo';
import { erc721 } from '@openzeppelin/wizard-cairo';
import { erc721Schema } from '../schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof erc721Schema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerCairoERC721(new McpServer(testMcpInfo));
  t.context.schema = z.object(erc721Schema);
});

function assertHasAllSupportedFields(t: ExecutionContext<Context>, params: Required<z.infer<typeof t.context.schema>>) {
  const _: Required<ERC721Options> = params;
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
  const params: Required<z.infer<typeof t.context.schema>> = {
    name: 'MyNFT',
    symbol: 'NFT',
    baseUri: 'https://example.com/nft/',
    burnable: true,
    pausable: true,
    mintable: true,
    enumerable: true,
    votes: true,
    royaltyInfo: {
      enabled: true,
      defaultRoyaltyFraction: '500',
      feeDenominator: '10000',
    },
    appName: 'MyNFT',
    appVersion: 'v1',
    access: 'roles',
    upgradeable: true,
    info: {
      license: 'MIT',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, erc721.print);
});
