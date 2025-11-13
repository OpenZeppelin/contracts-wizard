import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCairoERC1155 } from './erc1155';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { ERC1155Options } from '@openzeppelin/wizard-cairo';
import { erc1155 } from '@openzeppelin/wizard-cairo';
import { erc1155Schema } from '../schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof erc1155Schema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerCairoERC1155(new McpServer(testMcpInfo));
  t.context.schema = z.object(erc1155Schema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<ERC1155Options> = params;
  t.pass();
}

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'MyNFT',
    baseUri: 'https://example.com/nft/',
  };
  await assertAPIEquivalence(t, params, erc1155.print);
});

test('all', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'MyNFT',
    baseUri: 'https://example.com/nft/',
    burnable: true,
    pausable: true,
    mintable: true,
    updatableUri: true,
    royaltyInfo: {
      enabled: true,
      defaultRoyaltyFraction: '500',
      feeDenominator: '10000',
    },
    access: 'roles',
    upgradeable: true,
    info: {
      license: 'MIT',
      securityContact: 'security@example.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, erc1155.print);
});
