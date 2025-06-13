import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityAccount } from './account';
import { testMcpInfo, testMcpContext } from '../../helpers.test';
import { AccountOptions } from '@openzeppelin/wizard';

interface Context {
    tool: RegisteredTool;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerSolidityAccount(new McpServer(testMcpInfo));
});

async function assertSnapshot(t: ExecutionContext<Context>, params: AccountOptions) {
    const result = await t.context.tool.callback(
        {
            ...params,
            ...testMcpContext,
        },
        testMcpContext
    );

    t.snapshot(result?.content[0]?.text);
}

test('solidity account basic', async (t) => {
    const params: AccountOptions = {
        name: 'MyAccount',
    };
    await assertSnapshot(t, params);
});

test('solidity account all', async (t) => {
    const params: Required<AccountOptions> = {
        name: 'MyAccount',
        signatureValidation: 'ERC1271',
        ERC721Holder: true,
        ERC1155Holder: true,
        signer: 'ECDSA',
        batchedExecution: true,
        ERC7579Modules: 'AccountERC7579',
        access: false,
        upgradeable: false,
        info: {
            license: 'MIT',
            securityContact: 'security@example.com',
        },
    };
    await assertSnapshot(t, params);
});
