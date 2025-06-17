import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerCairoMultisig } from './multisig';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import { multisig, MultisigOptions } from '@openzeppelin/wizard-cairo';
import { multisigSchema } from '../schemas';
import { z } from 'zod';

interface Context {
    tool: RegisteredTool;
    schema: z.ZodObject<typeof multisigSchema>;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerCairoMultisig(new McpServer(testMcpInfo));
    t.context.schema = z.object(multisigSchema);
});

function assertHasAllSupportedFields(t: ExecutionContext<Context>, params: Required<z.infer<typeof t.context.schema>>) {
    const _: Required<MultisigOptions> = params;
    t.pass();
}

test('basic', async (t) => {
    const params: z.infer<typeof t.context.schema> = {
        name: 'MyMultisig',
        quorum: '2',
    };
    await assertAPIEquivalence(t, params, multisig.print);
});

test('all', async (t) => {
    const params: Required<z.infer<typeof t.context.schema>> = {
        name: 'MyMultisig',
        quorum: '50',
        upgradeable: true,
        info: {
            license: 'MIT',
        },
    };
    assertHasAllSupportedFields(t, params);
    await assertAPIEquivalence(t, params, multisig.print);
});
