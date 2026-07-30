import fs from 'fs';
import path from 'path';
import type { McpServer, RegisteredTool, ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ZodRawShapeCompat } from '@modelcontextprotocol/sdk/server/zod-compat.js';
import { codeBlock, formatPrintError } from '../utils';

/** MIME type for MCP Apps HTML resources. */
export const RESOURCE_MIME_TYPE = 'text/html;profile=mcp-app';

const RESOURCE_URI_META_KEY = 'ui/resourceUri';

const APPS_DIR = path.join(__dirname, '..', '..', 'apps');

export function appResourceUri(toolName: string): string {
  return `ui://openzeppelin/${toolName}.html`;
}

/** Resolve HTML for a tool, throwing build guidance when the artifact is missing. */
function resolveAppHtmlPath(toolName: string): string {
  const toolPath = path.join(APPS_DIR, `${toolName}.html`);
  if (fs.existsSync(toolPath)) {
    return toolPath;
  }
  throw new Error(
    `MCP App HTML missing for ${toolName} (looked in ${APPS_DIR}). ` +
      `Run: yarn --cwd packages/mcp build:apps ` +
      `(npm consumers: reinstall the package or report a packaging bug).`,
  );
}

/**
 * App HTML is an immutable build artifact, so it is read from disk at most once per tool and then
 * served from memory. Keyed by tool name rather than per request or per session, so the hosted
 * server holds one copy no matter how many sessions open the same app; memory is bounded by the
 * number of tools, not by traffic.
 *
 * The in-flight promise is cached so concurrent first reads share a single disk read, and a failed
 * read is evicted so a transient error cannot poison a tool for the process lifetime.
 */
const htmlCache = new Map<string, Promise<string>>();

export function readAppHtml(toolName: string): Promise<string> {
  const cached = htmlCache.get(toolName);
  if (cached !== undefined) {
    return cached;
  }
  const pending = fs.promises.readFile(resolveAppHtmlPath(toolName), 'utf-8').catch((e: unknown) => {
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
  resolveAppHtmlPath(toolName);
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
