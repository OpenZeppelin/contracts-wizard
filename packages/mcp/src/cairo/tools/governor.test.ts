import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCairoGovernor } from './governor';
import { testMcpInfo, testMcpContext } from '../../helpers.test';
import { GovernorOptions } from '@openzeppelin/wizard-cairo';
import { governorSchema } from '../schemas';
import { z } from 'zod';

interface Context {
    tool: RegisteredTool;
    schema: z.ZodObject<typeof governorSchema>;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerCairoGovernor(new McpServer(testMcpInfo));
    t.context.schema = z.object(governorSchema);
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
    const _: Required<GovernorOptions> = params;
    t.pass();
}

test('basic', async (t) => {
    const params: z.infer<typeof t.context.schema> = {
        name: 'MyGovernor',
        delay: '1',
        period: '1',
    };
    await assertSnapshot(t, params);
});

test('all', async (t) => {
    const params: Required<z.infer<typeof t.context.schema>> = {
        name: 'MyGovernor',
        delay: '4 day',
        period: '4 week',
        proposalThreshold: '500',
        decimals: 10,
        quorumMode: 'absolute',
        quorumPercent: 50,
        quorumAbsolute: '200',
        votes: 'erc721votes',
        clockMode: 'timestamp',
        timelock: 'openzeppelin',
        settings: true,
        appName: 'MyApp2',
        appVersion: 'v5',
        upgradeable: true,
        info: {
            license: 'MIT',
        },
    };
    assertHasAllSupportedFields(t, params);
    await assertSnapshot(t, params);
});
