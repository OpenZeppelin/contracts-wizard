import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import type { RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerTronCustom } from './custom';
import type { DeepRequired } from '../../helpers.test';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import type { CustomOptions } from '@openzeppelin/wizard';
import { buildGeneric, printContract, tronPrintProfile } from '@openzeppelin/wizard';
import { solidityCustomSchema } from '@openzeppelin/wizard-common/schemas';
import { z } from 'zod';

interface Context {
  tool: RegisteredTool;
  schema: z.ZodObject<typeof solidityCustomSchema>;
}

const test = _test as TestFn<Context>;

test.before(t => {
  t.context.tool = registerTronCustom(new McpServer(testMcpInfo));
  t.context.schema = z.object(solidityCustomSchema);
});

function assertHasAllSupportedFields(
  t: ExecutionContext<Context>,
  params: DeepRequired<z.infer<typeof t.context.schema>>,
) {
  const _: DeepRequired<CustomOptions> = params;
  t.pass();
}

const tronPrint = (opts: CustomOptions) => printContract(buildGeneric({ kind: 'Custom', ...opts }), tronPrintProfile);

test('basic', async t => {
  const params: z.infer<typeof t.context.schema> = {
    name: 'MyCustom',
  };
  await assertAPIEquivalence(t, params, tronPrint);
});

test('all', async t => {
  const params: DeepRequired<z.infer<typeof t.context.schema>> = {
    name: 'MyCustom',
    pausable: true,
    access: 'roles',
    upgradeable: 'uups',
    info: {
      license: 'MIT',
      securityContact: 'security@example.com',
    },
  };
  assertHasAllSupportedFields(t, params);
  await assertAPIEquivalence(t, params, tronPrint);
});
