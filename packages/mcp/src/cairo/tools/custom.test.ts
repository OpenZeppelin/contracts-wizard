import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCairoCustom } from './custom';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import { custom, CustomOptions } from '@openzeppelin/wizard-cairo';
import { customSchema } from '../schemas';
import { z } from 'zod';

interface Context {
    tool: RegisteredTool;
    schema: z.ZodObject<typeof customSchema>;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerCairoCustom(new McpServer(testMcpInfo));
    t.context.schema = z.object(customSchema);
});

function assertHasAllSupportedFields(t: ExecutionContext<Context>, params: Required<z.infer<typeof t.context.schema>>) {
    const _: Required<CustomOptions> = params;
    t.pass();
}

test('basic', async (t) => {
    const params: z.infer<typeof t.context.schema> = {
        name: 'MyAccount',
    };
    await assertAPIEquivalence(t, params, custom.print);
});

test('all', async (t) => {
    const params: Required<z.infer<typeof t.context.schema>> = {
        name: 'MyAccount',
        pausable: true,
        access: 'roles',
        upgradeable: true,
        info: {
            license: 'MIT',
        },
    };
    assertHasAllSupportedFields(t, params);
    await assertAPIEquivalence(t, params, custom.print);
});
