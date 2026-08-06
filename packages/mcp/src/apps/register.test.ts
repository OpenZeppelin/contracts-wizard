import test from 'ava';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { testMcpInfo } from '../helpers.test';
import {
  appResourceUri,
  getToolAppSpec,
  MCP_KIND_PLACEHOLDER,
  readAppHtml,
  registerWizardAppTool,
  RESOURCE_MIME_TYPE,
  TOOL_APP_SPECS,
  wizardAppResult,
} from './register';
import { registerSolidityERC20 } from '../solidity/tools/erc20';

test('solidity-erc20 registers UI metadata', t => {
  const server = new McpServer(testMcpInfo);
  const tool = registerSolidityERC20(server);
  const ui = tool._meta?.ui as { resourceUri?: string } | undefined;
  t.is(ui?.resourceUri, appResourceUri('solidity-erc20'));
  t.is(tool._meta?.['ui/resourceUri'], appResourceUri('solidity-erc20'));
});

test('TOOL_APP_SPECS entries have distinct per-tool URIs and known overrides', t => {
  const tools = Object.keys(TOOL_APP_SPECS);
  t.true(tools.length >= 26, `expected at least 26 tools, got ${tools.length}`);
  for (const tool of tools) {
    const spec = getToolAppSpec(tool);
    t.truthy(spec.template, `${tool} missing template`);
    t.truthy(spec.kind, `${tool} missing kind`);
    t.is(appResourceUri(tool), `ui://openzeppelin/${tool}.html`);
  }
  t.is(TOOL_APP_SPECS['solidity-rwa']?.kind, 'RealWorldAsset');
  t.is(TOOL_APP_SPECS['uniswap-hooks']?.kind, 'Hooks');
});

test('MCP App HTML artifacts exist and inject kind for Wizard-backed tools', async t => {
  const tools = Object.keys(TOOL_APP_SPECS).sort();
  for (const tool of tools) {
    const spec = getToolAppSpec(tool);
    const html = await readAppHtml(tool);
    t.true(html.includes('<!DOCTYPE html>'), `${tool} missing doctype`);
    t.true(html.includes('<script>'), `${tool} missing script`);
    t.true(html.length > 10_000, `${tool} HTML unexpectedly small`);
    t.false(html.includes(MCP_KIND_PLACEHOLDER), `${tool} still contains kind placeholder`);
    t.true(html.includes(spec.kind), `${tool} missing injected kind ${spec.kind}`);
  }
});

test('kind injection differentiates tools that share a language template', async t => {
  const erc20 = await readAppHtml('solidity-erc20');
  const erc721 = await readAppHtml('solidity-erc721');
  t.not(erc20, erc721, 'shared language template must produce distinct per-tool HTML after kind inject');
  t.false(erc20.includes(MCP_KIND_PLACEHOLDER));
  t.false(erc721.includes(MCP_KIND_PLACEHOLDER));
  // Kind names also appear as Controls keys in the full language bundle; the mount argument is what differs.
  t.true(Math.abs(erc20.length - erc721.length) < 32, 'injected HTML should only differ by kind string length');
});

/**
 * Guards the two properties the hosted server depends on. mcp.openzeppelin.com consumes this
 * package as a library, so one long-lived process serves many sessions: the read must not block
 * the shared event loop, and a bundle must be held once per tool rather than re-read and
 * re-allocated per `resources/read`. Both are invisible to every other test, so without this a
 * refactor back to a synchronous or per-request read would pass CI.
 */
test('App HTML reads are async and memoized per tool', t => {
  const first = readAppHtml('solidity-erc20');
  const second = readAppHtml('solidity-erc20');

  t.true(first instanceof Promise, 'readAppHtml must return a promise, not perform a blocking read');
  t.is(first, second, 'repeated reads of one tool must share a single cached read');
});

test('RESOURCE_MIME_TYPE is the MCP Apps profile', t => {
  t.is(RESOURCE_MIME_TYPE, 'text/html;profile=mcp-app');
});

test('kind placeholder stays in sync across mcp, ui, and packaging script', async t => {
  const { readFile } = await import('fs/promises');
  const { join } = await import('path');
  const uiPlaceholderSrc = await readFile(join(__dirname, '../../../ui/src/mcp-apps/kind-placeholder.ts'), 'utf-8');
  const packageScript = await readFile(join(__dirname, '../../../ui/scripts/package-mcp-apps.mjs'), 'utf-8');
  t.regex(uiPlaceholderSrc, new RegExp(`MCP_KIND_PLACEHOLDER\\s*=\\s*'${MCP_KIND_PLACEHOLDER}'`));
  t.regex(packageScript, new RegExp(`MCP_KIND_PLACEHOLDER\\s*=\\s*'${MCP_KIND_PLACEHOLDER}'`));
});

test('missing App mapping fails closed with guidance', t => {
  const err = t.throws(() => readAppHtml('definitely-missing-tool-xyz'));
  t.true(err instanceof Error);
  t.regex((err as Error).message, /MCP App mapping missing/);
  t.regex((err as Error).message, /TOOL_APP_SPECS|build:apps/);
});

test('registerWizardAppTool fails closed when mapping missing', t => {
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
  t.regex((err as Error).message, /MCP App mapping missing/);
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

/**
 * Live registry check via compiled createServer (ava/ts-node cannot load server.ts .js imports).
 * Ensures every mapped tool got registerWizardAppTool UI metadata and a registered UI resource
 * (not a bare registerTool with hand-copied _meta).
 */
test('createServer wires MCP App UI metadata for every TOOL_APP_SPECS tool', t => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports -- ava/ts-node cannot load server.ts .js imports
  const { createServer } = require('../../dist/server.js') as { createServer: () => McpServer };
  const server = createServer();
  const { _registeredTools: tools, _registeredResources: resources } = server as unknown as {
    _registeredTools: Record<string, { _meta?: { ui?: { resourceUri?: string }; [key: string]: unknown } }>;
    _registeredResources: Record<string, unknown>;
  };

  for (const toolName of Object.keys(TOOL_APP_SPECS)) {
    const tool = tools[toolName];
    const uri = appResourceUri(toolName);
    t.truthy(tool, `createServer did not register '${toolName}'`);
    t.is(tool!._meta?.ui?.resourceUri, uri, `${toolName} missing UI resourceUri`);
    t.is(tool!._meta?.['ui/resourceUri'], uri, `${toolName} missing ui/resourceUri`);
    t.true(uri in resources, `${toolName} advertises ${uri} but createServer did not registerResource that URI`);
  }
});
