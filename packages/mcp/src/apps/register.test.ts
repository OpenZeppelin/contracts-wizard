import test from 'ava';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { testMcpInfo } from '../helpers.test';
import { appResourceUri, readAppHtml, registerWizardAppTool, RESOURCE_MIME_TYPE, wizardAppResult } from './register';
import { registerSolidityERC20 } from '../solidity/tools/erc20';

test('solidity-erc20 registers UI metadata', t => {
  const server = new McpServer(testMcpInfo);
  const tool = registerSolidityERC20(server);
  const ui = tool._meta?.ui as { resourceUri?: string } | undefined;
  t.is(ui?.resourceUri, appResourceUri('solidity-erc20'));
  t.is(tool._meta?.['ui/resourceUri'], appResourceUri('solidity-erc20'));
});

test('MCP App HTML artifacts exist for Wizard-backed tools', t => {
  // One tool per language; registerWizardAppTool fails closed for the rest at server start.
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

test('missing App HTML fails closed with build:apps guidance', t => {
  const err = t.throws(() => readAppHtml('definitely-missing-tool-xyz'));
  t.true(err instanceof Error);
  t.regex((err as Error).message, /MCP App HTML missing/);
  t.regex((err as Error).message, /build:apps/);
});

test('registerWizardAppTool fails closed when HTML missing', t => {
  const server = new McpServer(testMcpInfo);
  const err = t.throws(() =>
    registerWizardAppTool(
      server,
      'definitely-missing-tool-xyz',
      {
        description: 'missing app',
        inputSchema: {},
      },
      async () => ({
        content: [{ type: 'text', text: 'unused' }],
      }),
    ),
  );
  t.true(err instanceof Error);
  t.regex((err as Error).message, /MCP App HTML missing/);
  t.regex((err as Error).message, /build:apps/);
});

test('wizardAppResult sets top-level isError on failure', t => {
  const ok = wizardAppResult({ name: 'A' }, '```solidity\ncode\n```', 'code');
  t.falsy('isError' in ok && ok.isError);
  t.is(ok.structuredContent.code, 'code');

  const fail = wizardAppResult({ name: 'A' }, 'bad options', undefined, true);
  t.true(fail.isError);
  t.is(fail.content[0]?.text, 'bad options');
  t.is(fail.structuredContent.code, undefined);
  t.is(fail.structuredContent.error, 'bad options');
});
