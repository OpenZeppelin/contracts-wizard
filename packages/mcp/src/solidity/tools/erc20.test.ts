import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityERC20 } from './erc20';
import { testMcpInfo, testMcpContext } from '../../helpers.test';
import { ERC20Options } from '@openzeppelin/wizard';

interface Context {
    tool: RegisteredTool;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerSolidityERC20(new McpServer(testMcpInfo));
});

async function assertSnapshot(t: ExecutionContext<Context>, params: ERC20Options) {
    const result = await t.context.tool.callback(
        {
            ...params,
            ...testMcpContext,
        },
        testMcpContext
    );

    t.snapshot(result?.content[0]?.text);
}

test('solidity erc20 basic', async (t) => {
    const params: ERC20Options = {
        name: 'TestToken',
        symbol: 'TST',
    };
    await assertSnapshot(t, params);
});

test('solidity erc20 all', async (t) => {
    const params: Required<ERC20Options> = {
        name: 'TestToken',
        symbol: 'TST',
        burnable: true,
        pausable: true,
        premint: '1000000',
        premintChainId: '1',
        mintable: true,
        callback: true,
        permit: true,
        votes: true,
        flashmint: true,
        crossChainBridging: false,
        access: 'roles',
        upgradeable: 'transparent',
        info: {
            license: 'MIT',
            securityContact: 'security@example.com',
        },
    };
    await assertSnapshot(t, params);
});
