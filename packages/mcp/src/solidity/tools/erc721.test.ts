import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityERC721 } from './erc721';
import { testMcpInfo, testMcpContext } from '../../helpers.test';
import { ERC721Options } from '@openzeppelin/wizard';
import { erc721Schema } from '../schemas';
import { z } from 'zod';

interface Context {
    tool: RegisteredTool;
    schema: z.ZodObject<typeof erc721Schema>;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerSolidityERC721(new McpServer(testMcpInfo));
    t.context.schema = z.object(erc721Schema);
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
    const _: Required<ERC721Options> = params;
    t.pass();
}

test('solidity erc721 basic', async (t) => {
    const params: z.infer<typeof t.context.schema> = {
        name: 'MyNFT',
        symbol: 'NFT',
    };
    await assertSnapshot(t, params);
});

test('solidity erc721 all', async (t) => {
    const params: Required<z.infer<typeof t.context.schema>> = {
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
    assertHasAllSupportedFields(t, params);
    await assertSnapshot(t, params);
});
