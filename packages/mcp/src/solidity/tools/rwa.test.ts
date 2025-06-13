import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityRWA } from './rwa';
import { testMcpInfo, testMcpContext } from '../../helpers.test';
import { StablecoinOptions } from '@openzeppelin/wizard';
import { rwaSchema } from '../schemas';
import { z } from 'zod';

interface Context {
    tool: RegisteredTool;
    schema: z.ZodObject<typeof rwaSchema>;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerSolidityRWA(new McpServer(testMcpInfo));
    t.context.schema = z.object(rwaSchema);
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
    const _: Required<StablecoinOptions> = params;
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
        name: 'MyRWA',
        symbol: 'RWA',
        premint: '2000',
        access: 'roles',
        burnable: true,
        mintable: true,
        pausable: true,
        callback: true,
        permit: true,
        votes: 'blocknumber',
        flashmint: true,
        crossChainBridging: 'custom',
        premintChainId: '10',
        limitations: 'allowlist',
        custodian: true,
        upgradeable: 'transparent',
        info: {
            license: 'MIT',
            securityContact: 'security@example.com',
        },
    };

    assertHasAllSupportedFields(t, params);

    // Records an error in the snapshot, because some fields are incompatible with each other.
    // This is ok, because we just need to check that all fields can be passed in.
    await assertSnapshot(t, params);
});
