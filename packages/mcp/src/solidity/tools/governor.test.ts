import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityGovernor } from './governor';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import { GovernorOptions } from '@openzeppelin/wizard';
import { governorSchema } from '../schemas';
import { z } from 'zod';

interface Context {
    tool: RegisteredTool;
    schema: z.ZodObject<typeof governorSchema>;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerSolidityGovernor(new McpServer(testMcpInfo));
    t.context.schema = z.object(governorSchema);
});

function assertHasAllSupportedFields(t: ExecutionContext<Context>, params: Required<z.infer<typeof t.context.schema>>) {
    const _: Required<Omit<GovernorOptions, 'access'>> = params;
    t.pass();
}

test('basic', async (t) => {
    const params: z.infer<typeof t.context.schema> = {
        name: 'MyGovernor',
        delay: '1 day',
        period: '1 week',
    };
    await assertAPIEquivalence(t, params, governor.print);
});

test('all', async (t) => {
    const params: Required<z.infer<typeof t.context.schema>> = {
        name: 'MyGovernor',
        delay: '1 day',
        period: '1 week',
        votes: 'erc20votes',
        clockMode: 'blocknumber',
        timelock: 'openzeppelin',
        blockTime: 12,
        decimals: 18,
        proposalThreshold: '1',
        quorumMode: 'absolute',
        quorumPercent: 0,
        quorumAbsolute: '5',
        storage: true,
        settings: true,
        upgradeable: 'uups',
        info: {
            license: 'MIT',
            securityContact: 'security@example.com',
        },
    };
    assertHasAllSupportedFields(t, params);
    await assertAPIEquivalence(t, params, governor.print);
});
