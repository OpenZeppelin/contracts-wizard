import test from 'ava';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { testMcpInfo } from '../helpers.test';
import { appResourceUri, readAppHtml, RESOURCE_MIME_TYPE } from './register';
import { registerSolidityERC20 } from '../solidity/tools/erc20';

test('solidity-erc20 registers UI metadata', t => {
  const server = new McpServer(testMcpInfo);
  const tool = registerSolidityERC20(server);
  const ui = tool._meta?.ui as { resourceUri?: string } | undefined;
  t.is(ui?.resourceUri, appResourceUri('solidity-erc20'));
  t.is(tool._meta?.['ui/resourceUri'], appResourceUri('solidity-erc20'));
});

test('MCP App HTML artifacts exist for Wizard-backed tools', t => {
  const tools = [
    'solidity-erc20',
    'solidity-erc721',
    'cairo-erc20',
    'stellar-fungible',
    'stylus-erc20',
    'erc7984',
    'uniswap-hooks',
  ];
  for (const tool of tools) {
    const html = readAppHtml(tool);
    t.true(html.includes('<!DOCTYPE html>'), `${tool} missing doctype`);
    t.true(html.includes('<script>'), `${tool} missing script`);
    t.true(html.length > 10_000, `${tool} HTML unexpectedly small`);
  }
});

test('RESOURCE_MIME_TYPE is the MCP Apps profile', t => {
  t.is(RESOURCE_MIME_TYPE, 'text/html;profile=mcp-app');
});
