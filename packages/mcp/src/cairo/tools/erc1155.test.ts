import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCairoERC1155 } from './erc1155';
import { testMcpInfo, testMcpContext } from '../../helpers.test';
import { ERC1155Options } from '@openzeppelin/wizard-cairo-alpha';
import { erc1155Schema } from '../schemas';
import { z } from 'zod';

interface Context {
    tool: RegisteredTool;
    schema: z.ZodObject<typeof erc1155Schema>;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerCairoERC1155(new McpServer(testMcpInfo));
    t.context.schema = z.object(erc1155Schema);
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
    const _: Required<ERC1155Options> = params;
    t.pass();
}

test('basic', async (t) => {
    const params: z.infer<typeof t.context.schema> = {
        name: 'MyNFT',
        baseUri: 'https://example.com/nft/',
    };
    await assertSnapshot(t, params);
});

test('all', async (t) => {
    const params: Required<z.infer<typeof t.context.schema>> = {
        name: 'MyNFT',
        baseUri: 'https://example.com/nft/',
        burnable: true,
        pausable: true,
        mintable: true,
        updatableUri: true,
        royaltyInfo: {
            enabled: true,
            defaultRoyaltyFraction: '500',
            feeDenominator: '10000',
        },
        access: 'roles',
        upgradeable: true,
        info: {
            license: 'MIT',
        },
    };
    assertHasAllSupportedFields(t, params);
    await assertSnapshot(t, params);
});
