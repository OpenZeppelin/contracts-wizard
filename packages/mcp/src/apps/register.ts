import fs from 'fs';
import path from 'path';
import type { McpServer, RegisteredTool, ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ZodRawShapeCompat } from '@modelcontextprotocol/sdk/server/zod-compat.js';
import { codeBlock, formatPrintError } from '../utils';

/** MIME type for MCP Apps HTML resources. */
export const RESOURCE_MIME_TYPE = 'text/html;profile=mcp-app';

const RESOURCE_URI_META_KEY = 'ui/resourceUri';

const APPS_DIR = path.join(__dirname, '..', '..', 'apps');

/**
 * Placeholder kind baked into language HTML templates by the UI build.
 * Keep in sync with packages/ui/src/mcp-apps/kind-sentinel.ts and package-mcp-apps.mjs.
 */
export const MCP_KIND_SENTINEL = '__OZ_MCP_KIND__';

export type AppTemplate = 'solidity' | 'cairo' | 'stellar' | 'stylus' | 'confidential' | 'uniswap-hooks';

export type ToolAppSpec = {
  template: AppTemplate;
  kind: string;
};

/**
 * Exhaustive tool → language template + kind map. New Wizard tools must be added here
 * (or registration fails closed). Overrides match packages/mcp/src/server.test.ts:
 * solidity-rwa ← RealWorldAsset, uniswap-hooks ← Hooks.
 */
export const TOOL_APP_SPECS: Readonly<Record<string, ToolAppSpec>> = {
  'solidity-erc20': { template: 'solidity', kind: 'ERC20' },
  'solidity-erc721': { template: 'solidity', kind: 'ERC721' },
  'solidity-erc1155': { template: 'solidity', kind: 'ERC1155' },
  'solidity-stablecoin': { template: 'solidity', kind: 'Stablecoin' },
  'solidity-rwa': { template: 'solidity', kind: 'RealWorldAsset' },
  'solidity-account': { template: 'solidity', kind: 'Account' },
  'solidity-governor': { template: 'solidity', kind: 'Governor' },
  'solidity-custom': { template: 'solidity', kind: 'Custom' },

  'cairo-erc20': { template: 'cairo', kind: 'ERC20' },
  'cairo-erc721': { template: 'cairo', kind: 'ERC721' },
  'cairo-erc1155': { template: 'cairo', kind: 'ERC1155' },
  'cairo-account': { template: 'cairo', kind: 'Account' },
  'cairo-multisig': { template: 'cairo', kind: 'Multisig' },
  'cairo-governor': { template: 'cairo', kind: 'Governor' },
  'cairo-vesting': { template: 'cairo', kind: 'Vesting' },
  'cairo-custom': { template: 'cairo', kind: 'Custom' },

  'stellar-fungible': { template: 'stellar', kind: 'Fungible' },
  'stellar-non-fungible': { template: 'stellar', kind: 'NonFungible' },
  'stellar-stablecoin': { template: 'stellar', kind: 'Stablecoin' },
  'stellar-governor': { template: 'stellar', kind: 'Governor' },
  'stellar-vault': { template: 'stellar', kind: 'Vault' },

  'stylus-erc20': { template: 'stylus', kind: 'ERC20' },
  'stylus-erc721': { template: 'stylus', kind: 'ERC721' },
  'stylus-erc1155': { template: 'stylus', kind: 'ERC1155' },

  'confidential-erc7984': { template: 'confidential', kind: 'ERC7984' },

  'uniswap-hooks': { template: 'uniswap-hooks', kind: 'Hooks' },
};

export function appResourceUri(toolName: string): string {
  return `ui://openzeppelin/${toolName}.html`;
}

export function getToolAppSpec(toolName: string): ToolAppSpec {
  const spec = TOOL_APP_SPECS[toolName];
  if (spec === undefined) {
    throw new Error(
      `MCP App mapping missing for ${toolName}. ` +
        `Add it to TOOL_APP_SPECS in packages/mcp/src/apps/register.ts, then run: ` +
        `yarn --cwd packages/mcp build:apps`,
    );
  }
  return spec;
}

/** Resolve language HTML template path, throwing build guidance when missing. */
function resolveAppHtmlPath(template: AppTemplate, toolName: string): string {
  const templatePath = path.join(APPS_DIR, `${template}.html`);
  if (fs.existsSync(templatePath)) {
    return templatePath;
  }
  throw new Error(
    `MCP App HTML missing for ${toolName} (looked for template ${template}.html in ${APPS_DIR}). ` +
      `Run: yarn --cwd packages/mcp build:apps ` +
      `(npm consumers: reinstall the package or report a packaging bug).`,
  );
}

function injectKind(templateHtml: string, kind: string, toolName: string): string {
  // Replace the bare sentinel so either "__OZ_MCP_KIND__" or '__OZ_MCP_KIND__' becomes the kind.
  const matches = templateHtml.split(MCP_KIND_SENTINEL).length - 1;
  if (matches !== 1) {
    throw new Error(
      `MCP App template for ${toolName} must contain exactly one ${MCP_KIND_SENTINEL} ` +
        `sentinel (found ${matches}). Rebuild with yarn --cwd packages/mcp build:apps.`,
    );
  }
  const html = templateHtml.split(MCP_KIND_SENTINEL).join(kind);
  if (html.includes(MCP_KIND_SENTINEL)) {
    throw new Error(`MCP App kind injection left a sentinel in HTML for ${toolName}`);
  }
  if (!html.includes(kind)) {
    throw new Error(`MCP App kind injection failed to embed kind ${kind} for ${toolName}`);
  }
  return html;
}

/**
 * App HTML is an immutable build artifact, so it is read from disk at most once per tool and then
 * served from memory. Keyed by tool name rather than per request or per session, so the hosted
 * server holds one copy no matter how many sessions open the same app; memory is bounded by the
 * number of tools, not by traffic.
 *
 * Language templates are shared on disk; kind is injected once per tool on first read.
 *
 * The in-flight promise is cached so concurrent first reads share a single disk read, and a failed
 * read is evicted so a transient error cannot poison a tool for the process lifetime.
 *
 * Both properties are asserted by `App HTML reads are async and memoized per tool` in
 * register.test.ts — a synchronous or per-request read is a deliberate test failure, not a
 * refactor. See that test for why the hosted server depends on them.
 */
const htmlCache = new Map<string, Promise<string>>();
const templateCache = new Map<AppTemplate, Promise<string>>();

function readTemplateHtml(template: AppTemplate, toolName: string): Promise<string> {
  const cached = templateCache.get(template);
  if (cached !== undefined) {
    return cached;
  }
  const pending = fs.promises.readFile(resolveAppHtmlPath(template, toolName), 'utf-8').catch((e: unknown) => {
    templateCache.delete(template);
    throw e;
  });
  templateCache.set(template, pending);
  return pending;
}

export function readAppHtml(toolName: string): Promise<string> {
  const cached = htmlCache.get(toolName);
  if (cached !== undefined) {
    return cached;
  }
  // Resolve mapping synchronously so unknown tools fail before advertising UI.
  const spec = getToolAppSpec(toolName);
  // Fail closed on missing template before caching a doomed read.
  resolveAppHtmlPath(spec.template, toolName);

  const pending = readTemplateHtml(spec.template, toolName)
    .then(templateHtml => injectKind(templateHtml, spec.kind, toolName))
    .catch((e: unknown) => {
      htmlCache.delete(toolName);
      throw e;
    });
  htmlCache.set(toolName, pending);
  return pending;
}

/** Register an MCP App UI resource for a tool. */
function registerWizardAppResource(server: McpServer, toolName: string, options?: { title?: string }): void {
  const uri = appResourceUri(toolName);
  // Fail closed: do not register a UI resource that cannot be served.
  const spec = getToolAppSpec(toolName);
  resolveAppHtmlPath(spec.template, toolName);
  server.registerResource(
    options?.title ?? `${toolName} UI`,
    uri,
    {
      mimeType: RESOURCE_MIME_TYPE,
      description: `Interactive Wizard UI for ${toolName}`,
    },
    async () => ({
      contents: [
        {
          uri,
          mimeType: RESOURCE_MIME_TYPE,
          text: await readAppHtml(toolName),
        },
      ],
    }),
  );
}

type AppToolConfig<Args extends ZodRawShapeCompat> = {
  description: string;
  inputSchema: Args;
  title?: string;
};

/**
 * Register a generation tool with MCP Apps UI metadata and a matching UI resource.
 * Uses SDK `registerTool` / `registerResource` (CJS-safe; no ESM ext-apps import).
 *
 * Requires App HTML on disk (fail closed). Tool callbacks still return markdown text so
 * hosts without MCP Apps support continue to work once the server has started.
 */
export function registerWizardAppTool<Args extends ZodRawShapeCompat>(
  server: McpServer,
  toolName: string,
  config: AppToolConfig<Args>,
  cb: ToolCallback<Args>,
): RegisteredTool {
  const resourceUri = appResourceUri(toolName);
  // Fail closed before advertising UI meta: the resource registration resolves the HTML first.
  registerWizardAppResource(server, toolName, {
    title: config.title,
  });

  return server.registerTool(
    toolName,
    {
      title: config.title,
      description: config.description,
      inputSchema: config.inputSchema,
      _meta: {
        ui: { resourceUri },
        [RESOURCE_URI_META_KEY]: resourceUri,
      },
    },
    cb,
  );
}

/**
 * Print a contract and build the tool result: a Markdown code block plus raw code for the App on
 * success, or the formatted options error with `isError` on failure. `print` runs exactly once.
 */
export function wizardAppPrintResult(opts: unknown, print: () => string, syntaxHighlightingLanguage: string) {
  try {
    const code = print();
    return wizardAppResult(opts, codeBlock(code, syntaxHighlightingLanguage), code);
  } catch (e: unknown) {
    return wizardAppResult(opts, formatPrintError(e), undefined, true);
  }
}

/** Build a standard tool result with text for non-Apps hosts and structured data for the App. */
export function wizardAppResult(opts: unknown, markdownText: string, rawCode?: string, isError?: boolean) {
  return {
    content: [
      {
        type: 'text' as const,
        text: markdownText,
      },
    ],
    structuredContent: {
      opts,
      code: isError ? undefined : rawCode,
      error: isError ? markdownText : undefined,
    },
    ...(isError ? { isError: true as const } : {}),
  };
}
