import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStylusERC1155 } from './erc1155';
import { testMcpInfo, testMcpContext } from '../../helpers.test';
import { ERC1155Options } from '@openzeppelin/wizard-stylus';
import { erc1155Schema } from '../schemas';
import { z } from 'zod';

interface Context {
    tool: RegisteredTool;
    schema: z.ZodObject<typeof erc1155Schema>;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerStylusERC1155(new McpServer(testMcpInfo));
    t.context.schema = z.object(erc1155Schema);
});

async function assertSnapshot(t: ExecutionContext<Context>, params: ERC1155Options) {
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
    const _: Required<Omit<ERC1155Options, 'access'>> = params;
    t.pass();
}

test('stylus erc1155 basic', async (t) => {
    const params: z.infer<typeof t.context.schema> = {
        name: 'TestToken',
    };
    await assertSnapshot(t, params);
});

test('stylus erc1155 all', async (t) => {
    const params: Required<z.infer<typeof t.context.schema>> = {
        name: 'TestToken',
        burnable: true,
        supply: true,
        info: {
            license: 'MIT',
        },
    };
    assertHasAllSupportedFields(t, params);
    await assertSnapshot(t, params);
});