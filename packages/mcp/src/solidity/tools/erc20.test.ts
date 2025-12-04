import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityERC20 } from './erc20';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { ERC20Options } from '@openzeppelin/wizard';
import { erc20 } from '@openzeppelin/wizard';
import { erc20Schema } from '../schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof erc20Schema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerSolidityERC20(new McpServer(testMcpInfo));
  t.context.schema = z.object(erc20Schema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<ERC20Options> = params;
  t.pass();
}

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'TestToken',
    symbol: 'TST',
  };
  await assertAPIEquivalence(t, params, erc20.print);
});

test('crosschain embedded allowOverrides', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'TestToken',
    symbol: 'TST',
    crossChainBridging: 'embedded',
    crossChainLinkAllowOverride: true,
  };
  await assertAPIEquivalence(t, params, erc20.print);
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
    crossChainBridging: 'superchain',
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

  await assertAPIEquivalence(t, params, erc20.print);
});
