#!/usr/bin/env node
/**
 * After Rollup builds IIFE bundles under public/build/mcp/*.js,
 * produce single-file HTML documents with inlined JS for MCP resources/read.
 *
 * Language templates (solidity.html, …) contain the kind placeholder "__OZ_MCP_KIND__",
 * which packages/mcp replaces with the tool's kind at serve time.
 *
 * Optional: MCP_APP_LANGUAGE=<language> packages only that language template (keeps other HTML).
 * Example: MCP_APP_LANGUAGE=solidity
 */
import fs from 'fs';
import fsp from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mcpBuildDir = path.join(__dirname, '..', 'public', 'build', 'mcp');
const entriesDir = path.join(__dirname, '..', 'src', 'mcp-apps', 'entries');
const outDir = path.join(__dirname, '..', '..', 'mcp', 'apps');
const only = process.env.MCP_APP_LANGUAGE?.trim();

/** Keep in sync with MCP_KIND_PLACEHOLDER in packages/mcp/src/apps/register.ts */
const MCP_KIND_PLACEHOLDER = '__OZ_MCP_KIND__';

if (!fs.existsSync(mcpBuildDir)) {
  console.error(`Missing MCP build dir: ${mcpBuildDir}`);
  process.exit(1);
}

const allEntryNames = fs
  .readdirSync(entriesDir)
  .filter(f => f.endsWith('.ts'))
  .map(f => path.basename(f, '.ts'))
  .sort();

if (allEntryNames.length === 0) {
  console.error(`No MCP App entries found in ${entriesDir}`);
  process.exit(1);
}

const expectedNames = only ? allEntryNames.filter(name => name === only) : allEntryNames;
if (expectedNames.length === 0) {
  console.error(`No MCP App entry matching MCP_APP_LANGUAGE="${only}" (expected a language name like solidity)`);
  process.exit(1);
}

if (!only) {
  // Full builds drop prior HTML so renamed/deleted entries cannot leave stale artifacts.
  fs.rmSync(outDir, { recursive: true, force: true });
}
fs.mkdirSync(outDir, { recursive: true });

const missingJs = expectedNames.filter(name => !fs.existsSync(path.join(mcpBuildDir, `${name}.js`)));
if (missingJs.length > 0) {
  console.error(`MCP App JS bundles missing for entries:\n  ${missingJs.join('\n  ')}`);
  process.exit(1);
}

// Keep in sync with MCP_APP_HEIGHT_PX in src/mcp-apps/mount.ts, which reports this
// height to the host and sets it as --mcp-app-height once the bundle runs. This only
// has to hold the iframe open until then.
const INITIAL_HEIGHT_PX = 560;

function assertExactlyOneKindPlaceholder(name, html) {
  const matches = html.split(MCP_KIND_PLACEHOLDER).length - 1;
  if (matches !== 1) {
    throw new Error(
      `MCP App template "${name}" must contain exactly one ${MCP_KIND_PLACEHOLDER} ` +
        `kind placeholder for serve-time kind injection (found ${matches}).`,
    );
  }
}

// Each app is independent, so read/write them concurrently rather than one at a time.
await Promise.all(
  expectedNames.map(async name => {
    const js = await fsp.readFile(path.join(mcpBuildDir, `${name}.js`), 'utf-8');
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>OpenZeppelin ${name}</title>
  <style>
    /* Do not use height:100% — MCP Apps autoResize measures with max-content and
       percentage heights collapse to ~0, which shrinks the host iframe over time. */
    html, body { margin: 0; padding: 0; background: #f9fafb; }
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; min-height: ${INITIAL_HEIGHT_PX}px; }
  </style>
</head>
<body>
<script>
${js}
</script>
</body>
</html>
`;
    assertExactlyOneKindPlaceholder(name, html);

    // Light CSS sanity: Control layout class present; a known web-only utility absent.
    if (!html.includes('controls-section')) {
      throw new Error(`MCP App template "${name}" missing expected Control CSS class controls-section`);
    }
    for (const webOnly of ['100vh-84px', 'rounded-l-3xl']) {
      if (html.includes(webOnly)) {
        throw new Error(`MCP App template "${name}" unexpectedly contains web-only class ${webOnly}`);
      }
    }

    const outPath = path.join(outDir, `${name}.html`);
    await fsp.writeFile(outPath, html);
    console.log(`Wrote ${outPath} (${Math.round(html.length / 1024)} KiB)`);
  }),
);

if (only) {
  console.log(`Packaged MCP App "${only}" (other apps left unchanged).`);
} else {
  console.log(`Verified ${expectedNames.length} MCP App HTML language templates match entries.`);
}
