import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTronRWA } from './rwa';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { StablecoinOptions } from '@openzeppelin/wizard';
import { buildGeneric, printContract, tronPrintProfile } from '@openzeppelin/wizard';
import { solidityRWASchema } from '@openzeppelin/wizard-common/schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof solidityRWASchema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerTronRWA(new McpServer(testMcpInfo));
  t.context.schema = z.object(solidityRWASchema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<Omit<StablecoinOptions, 'upgradeable'>> = params;
  t.pass();
}

const tronPrint = (opts: StablecoinOptions) =>
  printContract(buildGeneric({ kind: 'RealWorldAsset', ...opts }), tronPrintProfile);

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'TestRWA',
    symbol: 'TRWA',
  };
  await assertAPIEquivalence(t, params, tronPrint);
});

test('all', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestRWA',
    symbol: 'TRWA',
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
    restrictions: 'allowlist',
    freezable: true,
    namespacePrefix: 'myProject',
    info: {
      license: 'MIT',
      securityContact: 'security@example.com',
    },
  };

  assertHasAllSupportedFields(t, params);

  await assertAPIEquivalence(t, params, tronPrint);
});
