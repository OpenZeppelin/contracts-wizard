import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityAccount } from './account';
import { testMcpInfo, assertAPIEquivalence } from '../../helpers.test';
import { account, AccountOptions } from '@openzeppelin/wizard';
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

function assertHasAllSupportedFields(t: ExecutionContext<Context>, params: Required<z.infer<typeof t.context.schema>>) {
    // omit fields that are documented as unsupported
    const _: Required<Omit<AccountOptions, 'access' | 'upgradeable'>> = params;
    t.pass();
}

test('basic', async (t) => {
    const params: z.infer<typeof t.context.schema> = {
        name: 'MyAccount',
    };
    await assertAPIEquivalence(t, params, account.print);
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
    await assertAPIEquivalence(t, params, account.print);
});
