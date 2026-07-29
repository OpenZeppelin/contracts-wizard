import fs from 'fs';
import path from 'path';
import type { McpServer, RegisteredTool, ToolCallback } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ZodRawShapeCompat } from '@modelcontextprotocol/sdk/server/zod-compat.js';

/** MIME type for MCP Apps HTML resources. */
export const RESOURCE_MIME_TYPE = 'text/html;profile=mcp-app';

const RESOURCE_URI_META_KEY = 'ui/resourceUri';

export function appResourceUri(toolName: string): string {
  return `ui://openzeppelin/${toolName}.html`;
}

/** Resolve HTML for a tool. */
export function resolveAppHtmlPath(toolName: string): string {
  const appsDir = path.join(__dirname, '..', '..', 'apps');
  const toolPath = path.join(appsDir, `${toolName}.html`);
  if (fs.existsSync(toolPath)) {
    return toolPath;
  }
  throw missingAppHtmlError(toolName, appsDir);
}

function missingAppHtmlError(toolName: string, appsDir: string): Error {
  return new Error(
    `MCP App HTML missing for ${toolName} (looked in ${appsDir}). ` +
      `Run: yarn --cwd packages/mcp build:apps ` +
      `(npm consumers: reinstall the package or report a packaging bug).`,
  );
}

/** True when the per-tool App HTML artifact exists on disk. */
export function appHtmlExists(toolName: string): boolean {
  const appsDir = path.join(__dirname, '..', '..', 'apps');
  return fs.existsSync(path.join(appsDir, `${toolName}.html`));
}

export function readAppHtml(toolName: string): string {
  return fs.readFileSync(resolveAppHtmlPath(toolName), 'utf-8');
}

/** Register an MCP App UI resource for a tool. */
export function registerWizardAppResource(server: McpServer, toolName: string, options?: { title?: string }): void {
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
          text: readAppHtml(toolName),
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
  // Fail closed before advertising UI meta if artifacts are missing.
  if (!appHtmlExists(toolName)) {
    throw missingAppHtmlError(toolName, path.join(__dirname, '..', '..', 'apps'));
  }
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
  };
}
