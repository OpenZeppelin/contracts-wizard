import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStellarGovernor } from './governor';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { GovernorOptions } from '@openzeppelin/wizard-stellar';
import { governor } from '@openzeppelin/wizard-stellar';
import { stellarGovernorSchema } from '@openzeppelin/wizard-common/schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof stellarGovernorSchema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerStellarGovernor(new McpServer(testMcpInfo));
  t.context.schema = z.object(stellarGovernorSchema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<GovernorOptions> = params;
  t.pass();
}

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'MyGovernor',
  };
  await assertAPIEquivalence(t, params, governor.print);
});

test('all explicit', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'MyGovernor',
    version: '1.0.0',
    votingDelay: '1',
    votingPeriod: '17280',
    proposalThreshold: '1',
    quorum: '1',
    timelock: true,
    upgradeable: true,
    access: 'roles',
    explicitImplementations: true,
    info: {
      license: 'MIT',
      securityContact: 'security@contact.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, governor.print);
});
