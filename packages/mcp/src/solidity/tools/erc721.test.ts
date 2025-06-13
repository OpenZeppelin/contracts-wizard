import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityERC721 } from './erc721';
import { testInfo, testContext } from '../../helpers.test';
import { ERC721Options } from '@openzeppelin/wizard';

interface Context {
    tool: RegisteredTool;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerSolidityERC721(new McpServer(testInfo));
});

async function assertSnapshot(t: ExecutionContext<Context>, params: ERC721Options) {
    const result = await t.context.tool.callback(
        {
            ...params,
            ...testContext,
        },
        testContext
    );

    t.snapshot(result?.content[0]?.text);
}

test('solidity erc721 basic', async (t) => {
    const params: ERC721Options = {
        name: 'MyNFT',
        symbol: 'NFT',
    };
    await assertSnapshot(t, params);
});

test('solidity erc721 all', async (t) => {
    const params: Required<ERC721Options> = {
        name: 'MyNFT',
        symbol: 'NFT',
        baseUri: 'https://example.com/nft/',
        enumerable: true,
        uriStorage: true,
        burnable: true,
        pausable: true,
        mintable: true,
        incremental: true,
        votes: 'blocknumber',
        access: 'roles',
        upgradeable: 'uups',
        info: {
            license: 'MIT',
            securityContact: 'security@example.com',
        },
    };
    await assertSnapshot(t, params);
});
