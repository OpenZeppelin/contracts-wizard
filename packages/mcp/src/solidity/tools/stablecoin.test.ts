import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityStablecoin } from './stablecoin';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import { stablecoin, StablecoinOptions } from '@openzeppelin/wizard';
import { stablecoinSchema } from '../schemas';
import { z } from 'zod';

interface Context {
    tool: RegisteredTool;
    schema: z.ZodObject<typeof stablecoinSchema>;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerSolidityStablecoin(new McpServer(testMcpInfo));
    t.context.schema = z.object(stablecoinSchema);
});

function assertHasAllSupportedFields(t: ExecutionContext<Context>, params: Required<z.infer<typeof t.context.schema>>) {
    const _: Required<Omit<StablecoinOptions, 'upgradeable'>> = params;
    t.pass();
}

test('basic', async (t) => {
    const params: z.infer<typeof t.context.schema> = {
        name: 'TestToken',
        symbol: 'TST',
    };
    await assertAPIEquivalence(t, params, stablecoin.print);
});

test('all', async (t) => {
    const params: Required<z.infer<typeof t.context.schema>> = {
        name: 'MyStablecoin',
        symbol: 'MST',
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
        info: {
            license: 'MIT',
            securityContact: 'security@example.com',
        },
    };

    assertHasAllSupportedFields(t, params);
    await assertAPIEquivalence(t, params, stablecoin.print);
});
