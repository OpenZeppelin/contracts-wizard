import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityGovernor } from './governor';
import { testMcpInfo, testMcpContext } from '../../helpers.test';
import { GovernorOptions } from '@openzeppelin/wizard';

interface Context {
    tool: RegisteredTool;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerSolidityGovernor(new McpServer(testMcpInfo));
});

async function assertSnapshot(t: ExecutionContext<Context>, params: GovernorOptions) {
    const result = await t.context.tool.callback(
        {
            ...params,
            ...testMcpContext,
        },
        testMcpContext
    );

    t.snapshot(result?.content[0]?.text);
}

test('solidity governor basic', async (t) => {
    const params: GovernorOptions = {
        name: 'MyGovernor',
        delay: '1 day',
        period: '1 week',
    };
    await assertSnapshot(t, params);
});

test('solidity governor all', async (t) => {
    const params: Required<GovernorOptions> = {
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
        access: false,
        upgradeable: 'uups',
        info: {
            license: 'MIT',
            securityContact: 'security@example.com',
        },
    };
    await assertSnapshot(t, params);
});
