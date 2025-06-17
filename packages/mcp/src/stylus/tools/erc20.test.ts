import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerStylusERC20 } from './erc20';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import { erc20, ERC20Options } from '@openzeppelin/wizard-stylus';
import { erc20Schema } from '../schemas';
import { z } from 'zod';

interface Context {
    tool: RegisteredTool;
    schema: z.ZodObject<typeof erc20Schema>;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerStylusERC20(new McpServer(testMcpInfo));
    t.context.schema = z.object(erc20Schema);
});

function assertHasAllSupportedFields(t: ExecutionContext<Context>, params: Required<z.infer<typeof t.context.schema>>) {
    const _: Required<Omit<ERC20Options, 'access'>> = params;
    t.pass();
}

test('basic', async (t) => {
    const params: z.infer<typeof t.context.schema> = {
        name: 'TestToken',
    };
    await assertAPIEquivalence(t, params, erc20.print);
});

test('all', async (t) => {
    const params: Required<z.infer<typeof t.context.schema>> = {
        name: 'TestToken',
        burnable: true,
        permit: true,
        flashmint: true,
        info: {
            license: 'MIT',
        },
    };
    assertHasAllSupportedFields(t, params);
    await assertAPIEquivalence(t, params, erc20.print);
});