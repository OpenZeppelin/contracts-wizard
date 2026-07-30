import test from 'ava';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { readFile } from 'fs/promises';

const PACKAGES_CORE_PATH = join(__dirname, '../../core');
const PACKAGES_MCP_SRC_PATH = join(__dirname);
const SERVER_TS_PATH = join(__dirname, 'server.ts');
const INDEX_TS_PATH = join(__dirname, 'index.ts');

function toPascalCase(value: string) {
  return value
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
}

// Languages that do not need MCP tools
const MCP_EXCLUDED_LANGUAGES: string[] = ['cairo_alpha'];

async function listDirNames(path: string) {
  const entries = await readdir(path, { withFileTypes: true });
  return entries.filter(entry => entry.isDirectory()).map(entry => entry.name);
}

/**
 * Language folders under packages/mcp/src, identified by having a packages/core counterpart
 * so that shared infrastructure folders (e.g. `apps`) need no hardcoded exclusion.
 */
async function listMcpLanguageDirs() {
  const [coreDirs, mcpDirs] = await Promise.all([
    listDirNames(PACKAGES_CORE_PATH),
    listDirNames(PACKAGES_MCP_SRC_PATH),
  ]);
  const coreLanguages = new Set(coreDirs);
  return mcpDirs.filter(name => coreLanguages.has(name));
}

test('each core language has mcp tools folder', async t => {
  const coreDirs = (await listDirNames(PACKAGES_CORE_PATH)).filter(name => !MCP_EXCLUDED_LANGUAGES.includes(name));
  const mcpDirs = await listMcpLanguageDirs();

  // Assert that each core directory has a corresponding mcp directory
  for (const coreDir of coreDirs) {
    t.true(
      mcpDirs.includes(coreDir),
      `Language folder '${coreDir}' from packages/core should have a corresponding folder in packages/mcp/src`,
    );
  }
});

test('each mcp tools folder is exported from index.ts', async t => {
  const mcpDirs = await listMcpLanguageDirs();

  // Read index.ts content
  const indexContent = await readFile(INDEX_TS_PATH, 'utf-8');

  // For each directory, check if its register function is exported from index.ts
  for (const mcpDir of mcpDirs) {
    const expectedExport = `register${toPascalCase(mcpDir)}Tools`;

    t.true(
      indexContent.includes(expectedExport),
      `Expected '${expectedExport}' not found in index.ts for language '${mcpDir}'`,
    );
  }
});

test('each mcp tools folder is registered in server.ts', async t => {
  const mcpDirs = await listMcpLanguageDirs();

  // Read server.ts content
  const serverContent = await readFile(SERVER_TS_PATH, 'utf-8');

  // For each directory, check if it's used in server.ts
  for (const mcpDir of mcpDirs) {
    t.true(
      serverContent.includes(`${mcpDir}/tools`),
      `Expected '${mcpDir}/tools' not found in server.ts for language '${mcpDir}'`,
    );
  }
});
