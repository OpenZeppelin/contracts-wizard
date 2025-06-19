import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCairoVesting } from './vesting';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { VestingOptions } from '@openzeppelin/wizard-cairo';
import { vesting } from '@openzeppelin/wizard-cairo';
import { vestingSchema } from '../schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof vestingSchema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerCairoVesting(new McpServer(testMcpInfo));
  t.context.schema = z.object(vestingSchema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<VestingOptions> = params;
  t.pass();
}

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'MyVesting',
    startDate: '2024-12-31T23:59',
    duration: '1 day',
    cliffDuration: '1 day',
    schedule: 'linear',
  };
  await assertAPIEquivalence(t, params, vesting.print);
});

test('all', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'CustomVesting',
    startDate: '2024-12-31T23:59',
    duration: '36 months',
    cliffDuration: '90 days',
    schedule: 'custom',
    info: {
      license: 'MIT',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, vesting.print);
});
