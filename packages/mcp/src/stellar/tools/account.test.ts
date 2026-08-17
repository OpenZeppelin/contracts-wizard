import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStellarAccount } from './account';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { AccountOptions } from '@openzeppelin/wizard-stellar';
import { account } from '@openzeppelin/wizard-stellar';
import { stellarAccountSchema } from '@openzeppelin/wizard-common/schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof stellarAccountSchema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerStellarAccount(new McpServer(testMcpInfo));
  t.context.schema = z.object(stellarAccountSchema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<AccountOptions> = params;
  t.pass();
}

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'TestAccount',
  };
  await assertAPIEquivalence(t, params, account.print);
});

test('all simple threshold', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestAccount',
    delegatedSigners: true,
    ed25519Signers: true,
    webauthnSigners: true,
    policy: 'simple-threshold',
    executionEntryPoint: true,
    upgradeable: true,
    info: {
      license: 'MIT',
      securityContact: 'security@contact.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, account.print);
});

test('all weighted threshold', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestAccount',
    delegatedSigners: true,
    ed25519Signers: true,
    webauthnSigners: true,
    policy: 'weighted-threshold',
    executionEntryPoint: true,
    upgradeable: true,
    info: {
      license: 'MIT',
      securityContact: 'security@contact.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, account.print);
});

test('no policy, webauthn only', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'TestAccount',
    delegatedSigners: false,
    ed25519Signers: false,
    webauthnSigners: true,
    policy: false,
    executionEntryPoint: false,
    upgradeable: false,
    info: {
      license: 'MIT',
      securityContact: 'security@contact.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, account.print);
});
