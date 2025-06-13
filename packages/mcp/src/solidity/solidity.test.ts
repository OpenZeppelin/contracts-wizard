import test from 'ava';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { registerSolidityERC20 } from './tools/erc20';
import { mcpServerTestContext } from '../helpers.test';
import { ERC20Options } from '@openzeppelin/wizard';

test('solidity erc20 basic', async (t) => {
    const server = new McpServer({ name: 'test', version: 'test' });
    const registeredTool = registerSolidityERC20(server);

    const result = await registeredTool.callback(
        {
            name: 'TestToken',
            symbol: 'TST',
            ...mcpServerTestContext,
        },
        mcpServerTestContext
    );

    t.snapshot(result?.content[0]?.text);
});

test('solidity erc20 all', async (t) => {
    const server = new McpServer({ name: 'test', version: 'test' });
    const registeredTool = registerSolidityERC20(server);

    const params: Required<ERC20Options> = {
        name: 'TestToken',
        symbol: 'TST',
        burnable: true,
        pausable: true,
        premint: '1000000',
        premintChainId: '1',
        mintable: true,
        callback: true,
        permit: true,
        votes: true,
        flashmint: true,
        crossChainBridging: false,
        access: 'roles',
        upgradeable: 'transparent',
        info: {
            license: 'MIT',
            securityContact: 'security@example.com',
        },
    };

    const result = await registeredTool.callback(
        {
            ...params,
            ...mcpServerTestContext,
        },
        mcpServerTestContext
    );

    t.snapshot(result?.content[0]?.text);
});