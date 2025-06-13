import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityRWA } from './rwa';
import { testMcpInfo, testMcpContext } from '../../helpers.test';
import { StablecoinOptions } from '@openzeppelin/wizard';

interface Context {
    tool: RegisteredTool;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerSolidityRWA(new McpServer(testMcpInfo));
});

async function assertSnapshot(t: ExecutionContext<Context>, params: StablecoinOptions) {
    const result = await t.context.tool.callback(
        {
            ...params,
            ...testMcpContext,
        },
        testMcpContext
    );

    t.snapshot(result?.content[0]?.text);
}

test('solidity rwa basic', async (t) => {
    const params: StablecoinOptions = {
        name: 'TestToken',
        symbol: 'TST',
    };
    await assertSnapshot(t, params);
});

test('solidity rwa all', async (t) => {
    const params: Required<StablecoinOptions> = {
        name: 'MyRWA',
        symbol: 'RWA',
        premint: '2000',
        access: 'roles',
        burnable: true,
        mintable: true,
        pausable: true,
        callback: true,
        permit: true,
        votes: true,
        flashmint: true,
        crossChainBridging: 'custom',
        premintChainId: '10',
        limitations: 'allowlist',
        custodian: true,
        upgradeable: false,
        info: {
            license: 'MIT',
            securityContact: 'security@example.com',
        },
    };
    await assertSnapshot(t, params);
});
