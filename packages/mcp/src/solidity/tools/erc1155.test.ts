import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import { McpServer, RegisteredTool } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityERC1155 } from './erc1155';
import { testMcpInfo, testMcpContext } from '../../helpers.test';
import { ERC1155Options } from '@openzeppelin/wizard';
import { erc1155Schema } from '../schemas';
import { z } from 'zod';

interface Context {
    tool: RegisteredTool;
    schema: z.ZodObject<typeof erc1155Schema>;
}

const test = _test as TestFn<Context>;

test.before((t) => {
    t.context.tool = registerSolidityERC1155(new McpServer(testMcpInfo));
    t.context.schema = z.object(erc1155Schema);
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
    const _: Required<ERC1155Options> = params;
    t.pass();
}

test('solidity erc1155 basic', async (t) => {
    const params: z.infer<typeof t.context.schema> = {
        name: 'MyTokens',
        uri: 'https://example.com/token/{id}.json',
    };
    await assertSnapshot(t, params);
});

test('solidity erc1155 all', async (t) => {
    const params: Required<z.infer<typeof t.context.schema>> = {
        name: 'MyTokens',
        uri: 'https://example.com/token/{id}.json',
        burnable: true,
        pausable: true,
        mintable: true,
        supply: true,
        updatableUri: true,
        access: 'roles',
        upgradeable: 'uups',
        info: {
            license: 'MIT',
            securityContact: 'security@example.com',
        },
    };
    assertHasAllSupportedFields(t, params);
    await assertSnapshot(t, params);
});
