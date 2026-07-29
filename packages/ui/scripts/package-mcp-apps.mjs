#!/usr/bin/env node
/**
 * After Rollup builds IIFE bundles under public/build/mcp/*.js,
 * produce single-file HTML documents with inlined JS for MCP resources/read.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const mcpBuildDir = path.join(__dirname, '..', 'public', 'build', 'mcp');
const entriesDir = path.join(__dirname, '..', 'src', 'mcp-apps', 'entries');
const outDir = path.join(__dirname, '..', '..', 'mcp', 'apps');

fs.mkdirSync(outDir, { recursive: true });

if (!fs.existsSync(mcpBuildDir)) {
  console.error(`Missing MCP build dir: ${mcpBuildDir}`);
  process.exit(1);
}

const expectedNames = fs
  .readdirSync(entriesDir)
  .filter(f => f.endsWith('.ts'))
  .map(f => path.basename(f, '.ts'))
  .sort();

const jsFiles = fs.readdirSync(mcpBuildDir).filter(f => f.endsWith('.js'));
if (jsFiles.length === 0) {
  console.error('No MCP App JS bundles found');
  process.exit(1);
}

for (const file of jsFiles) {
  const name = path.basename(file, '.js');
  const js = fs.readFileSync(path.join(mcpBuildDir, file), 'utf-8');
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
    body { font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, sans-serif; min-height: 560px; }
  </style>
</head>
<body>
<script>
${js}
</script>
</body>
</html>
`;
  const outPath = path.join(outDir, `${name}.html`);
  fs.writeFileSync(outPath, html);
  console.log(`Wrote ${outPath} (${Math.round(html.length / 1024)} KiB)`);
}

const missing = expectedNames.filter(name => !fs.existsSync(path.join(outDir, `${name}.html`)));
if (missing.length > 0) {
  console.error(`MCP App HTML missing after packaging:\n  ${missing.join('\n  ')}`);
  process.exit(1);
}

const builtNames = fs
  .readdirSync(outDir)
  .filter(f => f.endsWith('.html'))
  .map(f => path.basename(f, '.html'))
  .sort();
const unexpected = builtNames.filter(name => !expectedNames.includes(name));
if (unexpected.length > 0) {
  console.error(`Unexpected MCP App HTML (no entry):\n  ${unexpected.join('\n  ')}`);
  process.exit(1);
}

console.log(`Verified ${expectedNames.length} MCP App HTML artifacts match entries.`);
