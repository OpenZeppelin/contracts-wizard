import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCairoMultisig } from './multisig';
import { testMcpInfo, testMcpContext } from '../../helpers.test';
import { MultisigOptions } from '@openzeppelin/wizard-cairo';
import { multisigSchema } from '../schemas';
import { z } from 'zod';

interface Context {
    tool: RegisteredTool;
    schema: z.ZodObject<typeof multisigSchema>;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerCairoMultisig(new McpServer(testMcpInfo));
    t.context.schema = z.object(multisigSchema);
});

async function assertSnapshot(t: ExecutionContext<Context>, params: z.infer<typeof t.context.schema>) {
    const result = await t.context.tool.callback(
        {
            ...params,
            ...testMcpContext,
        },
        testMcpContext
    );

    t.snapshot(result?.content[0]?.text);
}

function assertHasAllSupportedFields(t: ExecutionContext<Context>, params: Required<z.infer<typeof t.context.schema>>) {
    const _: Required<MultisigOptions> = params;
    t.pass();
}

test('basic', async (t) => {
    const params: z.infer<typeof t.context.schema> = {
        name: 'MyMultisig',
        quorum: '2',
    };
    await assertSnapshot(t, params);
});

test('all', async (t) => {
    const params: Required<z.infer<typeof t.context.schema>> = {
        name: 'MyMultisig',
        quorum: '50',
        upgradeable: true,
        info: {
            license: 'MIT',
        },
    };
    assertHasAllSupportedFields(t, params);
    await assertSnapshot(t, params);
});
