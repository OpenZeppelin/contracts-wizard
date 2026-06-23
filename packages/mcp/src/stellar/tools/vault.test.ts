import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStellarVault } from './vault';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { VaultOptions } from '@openzeppelin/wizard-stellar';
import { vault } from '@openzeppelin/wizard-stellar';
import { stellarVaultSchema } from '@openzeppelin/wizard-common/schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof stellarVaultSchema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerStellarVault(new McpServer(testMcpInfo));
  t.context.schema = z.object(stellarVaultSchema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<VaultOptions> = params;
  t.pass();
}

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'TestVault',
    symbol: 'TVT',
  };
  await assertAPIEquivalence(t, params, vault.print);
});

test('all default', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestVault',
    symbol: 'TVT',
    pausable: true,
    upgradeable: true,
    access: 'ownable',
    explicitImplementations: false,
    info: {
      license: 'MIT',
      securityContact: 'security@contact.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, vault.print);
});

test('all explicit', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestVault',
    symbol: 'TVT',
    pausable: true,
    upgradeable: true,
    access: 'roles',
    explicitImplementations: true,
    info: {
      license: 'MIT',
      securityContact: 'security@contact.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, vault.print);
});
