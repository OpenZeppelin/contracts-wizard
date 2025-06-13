import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp';
import { registerSolidityERC1155 } from './erc1155';
import { testInfo, testContext } from '../../helpers.test';
import { ERC1155Options } from '@openzeppelin/wizard';

interface Context {
    tool: RegisteredTool;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerSolidityERC1155(new McpServer(testInfo));
});

async function assertSnapshot(t: ExecutionContext<Context>, params: ERC1155Options) {
    const result = await t.context.tool.callback(
        {
            ...params,
            ...testContext,
        },
        testContext
    );

    t.snapshot(result?.content[0]?.text);
}

test('solidity erc1155 basic', async (t) => {
    const params: ERC1155Options = {
        name: 'MyTokens',
        uri: 'https://example.com/token/{id}.json',
    };
    await assertSnapshot(t, params);
});

test('solidity erc1155 all', async (t) => {
    const params: Required<ERC1155Options> = {
        name: 'MyTokens',
        uri: 'https://example.com/token/{id}.json',
        burnable: true,
        pausable: true,
        mintable: true,
        supply: true,
        updatableUri: true,
        access: 'roles',
        upgradeable: 'uups',
        info: {
            license: 'MIT',
            securityContact: 'security@example.com',
        },
    };
    await assertSnapshot(t, params);
});
