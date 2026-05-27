import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTronTRC20 } from './erc20';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { ERC20Options } from '@openzeppelin/wizard';
import { erc20, rewriteForTron } from '@openzeppelin/wizard';
import { solidityERC20Schema } from '@openzeppelin/wizard-common/schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof solidityERC20Schema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerTronTRC20(new McpServer(testMcpInfo));
  t.context.schema = z.object(solidityERC20Schema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<ERC20Options> = params;
  t.pass();
}

// The TRON tool output is the Solidity Wizard's ERC20 source piped through
// `rewriteForTron`, so we use the same helper but pre-transform the expected.
const tronPrint = (opts: ERC20Options) => rewriteForTron(erc20.print(opts));

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'TestToken',
    symbol: 'TST',
  };
  await assertAPIEquivalence(t, params, tronPrint);
});

test('renames ERC20 to TRC20 and rewrites imports', async t => {
  // assertAPIEquivalence verifies the MCP tool output contains the result of
  // tronPrint(params) — which has already been rewritten to TRC20 +
  // @openzeppelin/tron-contracts. So if this passes, the tool is rewriting.
  const params: z.infer<typeof t.context.schema> = {
    name: 'TestToken',
    symbol: 'TST',
    burnable: true,
    permit: true,
  };
  await assertAPIEquivalence(t, params, tronPrint);
});

test('all', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestToken',
    symbol: 'TST',
    burnable: true,
    pausable: true,
    premint: '1000000',
    premintChainId: '1',
    mintable: true,
    callback: true,
    permit: true,
    votes: 'blocknumber',
    flashmint: true,
    crossChainBridging: 'custom',
    crossChainLinkAllowOverride: false,
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
