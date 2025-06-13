import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityGovernor } from './governor';
import { testMcpInfo, testMcpContext } from '../../helpers.test';
import { GovernorOptions } from '@openzeppelin/wizard';
import { governorSchema } from '../schemas';
import { z } from 'zod';

interface Context {
    tool: RegisteredTool;
    schema: z.ZodObject<typeof governorSchema>;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerSolidityGovernor(new McpServer(testMcpInfo));
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
    const _: Required<Omit<GovernorOptions, 'access'>> = params;
    t.pass();
}

test('basic', async (t) => {
    const params: z.infer<typeof t.context.schema> = {
        name: 'MyGovernor',
        delay: '1 day',
        period: '1 week',
    };
    await assertSnapshot(t, params);
});

test('all', async (t) => {
    const params: Required<z.infer<typeof t.context.schema>> = {
        name: 'MyGovernor',
        delay: '1 day',
        period: '1 week',
        votes: 'erc20votes',
        clockMode: 'blocknumber',
        timelock: 'openzeppelin',
        blockTime: 12,
        decimals: 18,
        proposalThreshold: '1',
        quorumMode: 'absolute',
        quorumPercent: 0,
        quorumAbsolute: '5',
        storage: true,
        settings: true,
        upgradeable: 'uups',
        info: {
            license: 'MIT',
            securityContact: 'security@example.com',
        },
    };
    assertHasAllSupportedFields(t, params);
    await assertSnapshot(t, params);
});
