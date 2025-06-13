import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityAccount } from './account';
import { testMcpInfo, testMcpContext } from '../../helpers.test';
import { AccountOptions } from '@openzeppelin/wizard';
import { accountSchema } from '../schemas';
import { z } from 'zod';

interface Context {
    tool: RegisteredTool;
    schema: z.ZodObject<typeof accountSchema>;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerSolidityAccount(new McpServer(testMcpInfo));
    t.context.schema = z.object(accountSchema);
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
    // omit fields that are documented as unsupported
    const _: Required<Omit<AccountOptions, 'access' | 'upgradeable'>> = params;
    t.pass();
}

test('basic', async (t) => {
    const params: z.infer<typeof t.context.schema> = {
        name: 'MyAccount',
    };
    await assertSnapshot(t, params);
});

test('all', async (t) => {
    const params: Required<z.infer<typeof t.context.schema>> = {
        name: 'MyAccount',
        signatureValidation: 'ERC1271',
        ERC721Holder: true,
        ERC1155Holder: true,
        signer: 'ECDSA',
        batchedExecution: true,
        ERC7579Modules: 'AccountERC7579',
        info: {
            license: 'MIT',
            securityContact: 'security@example.com',
        },
    };
    assertHasAllSupportedFields(t, params);
    await assertSnapshot(t, params);
});
