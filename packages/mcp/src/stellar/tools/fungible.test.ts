import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStellarFungible } from './fungible';
import { testMcpInfo, testMcpContext } from '../../helpers.test';
import { FungibleOptions } from '@openzeppelin/wizard-stellar';
import { fungibleSchema } from '../schemas';
import { z } from 'zod';

interface Context {
    tool: RegisteredTool;
    schema: z.ZodObject<typeof fungibleSchema>;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerStellarFungible(new McpServer(testMcpInfo));
    t.context.schema = z.object(fungibleSchema);
});

async function assertSnapshot(t: ExecutionContext<Context>, params: FungibleOptions) {
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
    const _: Required<Omit<FungibleOptions, 'access'>> = params;
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
        pausable: true,
        premint: '1000000',
        mintable: true,
        upgradeable: true,
        info: {
            license: 'MIT',
        },
    };
    assertHasAllSupportedFields(t, params);
    await assertSnapshot(t, params);
});