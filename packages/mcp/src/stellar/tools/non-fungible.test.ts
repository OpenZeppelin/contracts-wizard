import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStellarNonFungible } from './non-fungible';
import { testMcpInfo, testMcpContext } from '../../helpers.test';
import { FungibleOptions, NonFungibleOptions } from '@openzeppelin/wizard-stellar';
import { nonFungibleSchema } from '../schemas';
import { z } from 'zod';

interface Context {
    tool: RegisteredTool;
    schema: z.ZodObject<typeof nonFungibleSchema>;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerStellarNonFungible(new McpServer(testMcpInfo));
    t.context.schema = z.object(nonFungibleSchema);
});

async function assertSnapshot(t: ExecutionContext<Context>, params: NonFungibleOptions) {
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
    const _: Required<Omit<NonFungibleOptions, 'access'>> = params;
    t.pass();
}

test('basic', async (t) => {
    const params: z.infer<typeof t.context.schema> = {
        name: 'TestToken',
        symbol: 'TST',
    };
    await assertSnapshot(t, params);
});

test('all', async (t) => {
    const params: Required<z.infer<typeof t.context.schema>> = {
        name: 'TestToken',
        symbol: 'TST',
        burnable: true,
        enumerable: true,
        consecutive: true,
        pausable: true,
        upgradeable: true,
        mintable: true,
        sequential: true,
        info: {
            license: 'MIT',
        },
    };
    assertHasAllSupportedFields(t, params);
    await assertSnapshot(t, params);
});