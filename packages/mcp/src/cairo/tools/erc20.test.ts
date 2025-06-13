import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCairoERC20 } from './erc20';
import { testMcpInfo, testMcpContext } from '../../helpers.test';
import { ERC20Options, ERC721Options } from '@openzeppelin/wizard-cairo-alpha';
import { erc20Schema } from '../schemas';
import { z } from 'zod';

interface Context {
    tool: RegisteredTool;
    schema: z.ZodObject<typeof erc20Schema>;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerCairoERC20(new McpServer(testMcpInfo));
    t.context.schema = z.object(erc20Schema);
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
    const _: Required<ERC20Options> = params;
    t.pass();
}

test('basic', async (t) => {
    const params: z.infer<typeof t.context.schema> = {
        name: 'MyToken',
        symbol: 'MTK',
    };
    await assertSnapshot(t, params);
});

test('all', async (t) => {
    const params: Required<z.infer<typeof t.context.schema>> = {
        name: 'MyToken',
        symbol: 'MTK',
        burnable: true,
        pausable: true,
        premint: '1000000',
        mintable: true,
        votes: true,
        appName: 'MyToken',
        appVersion: 'v1',
        access: 'roles',
        upgradeable: true,
        info: {
            license: 'MIT',
        },
    };
    assertHasAllSupportedFields(t, params);
    await assertSnapshot(t, params);
});
