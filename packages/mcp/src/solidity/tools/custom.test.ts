import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityCustom } from './custom';
import { testMcpInfo, testMcpContext } from '../../helpers.test';
import { CustomOptions } from '@openzeppelin/wizard';

interface Context {
    tool: RegisteredTool;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerSolidityCustom(new McpServer(testMcpInfo));
});

async function assertSnapshot(t: ExecutionContext<Context>, params: CustomOptions) {
    const result = await t.context.tool.callback(
        {
            ...params,
            ...testMcpContext,
        },
        testMcpContext
    );

    t.snapshot(result?.content[0]?.text);
}

test('solidity custom basic', async (t) => {
    const params: CustomOptions = {
        name: 'MyCustom',
    };
    await assertSnapshot(t, params);
});

test('solidity custom all', async (t) => {
    const params: Required<CustomOptions> = {
        name: 'MyCustom',
        pausable: true,
        access: 'roles',
        upgradeable: 'uups',
        info: {
            license: 'MIT',
            securityContact: 'security@example.com',
        },
    };
    await assertSnapshot(t, params);
});
