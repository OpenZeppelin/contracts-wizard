import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStellarStablecoin } from './stablecoin';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { StablecoinOptions } from '@openzeppelin/wizard-stellar';
import { stablecoin } from '@openzeppelin/wizard-stellar';
import { stablecoinSchema } from '../schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof stablecoinSchema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerStellarStablecoin(new McpServer(testMcpInfo));
  t.context.schema = z.object(stablecoinSchema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<StablecoinOptions> = params;
  t.pass();
}

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'TestToken',
    symbol: 'TST',
  };
  await assertAPIEquivalence(t, params, stablecoin.print);
});

test('all default', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestToken',
    symbol: 'TST',
    burnable: true,
    pausable: true,
    premint: '1000000',
    mintable: true,
    upgradeable: true,
    access: 'ownable',
    limitations: 'allowlist',
    explicitImplementations: false,
    info: {
      license: 'MIT',
      securityContact: 'security@contact.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, stablecoin.print);
});

test('all explicit', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestToken',
    symbol: 'TST',
    burnable: true,
    pausable: true,
    premint: '1000000',
    mintable: true,
    upgradeable: true,
    access: 'ownable',
    limitations: 'allowlist',
    explicitImplementations: true,
    info: {
      license: 'MIT',
      securityContact: 'security@contact.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, stablecoin.print);
});
