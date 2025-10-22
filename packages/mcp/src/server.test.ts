import test from 'ava';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { readFile } from 'fs/promises';

const PACKAGES_CORE_PATH = join(__dirname, '../../core');
const PACKAGES_MCP_SRC_PATH = join(__dirname);
const SERVER_TS_PATH = join(__dirname, 'server.ts');

// Languages that do not need MCP tools
const MCP_EXCLUDED_LANGUAGES: string[] = ['cairo_alpha'];

test('each core language has mcp tools folder', async t => {
  // Get all directories in packages/core
  const coreEntries = await readdir(PACKAGES_CORE_PATH, { withFileTypes: true });
  const coreDirs = coreEntries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => !MCP_EXCLUDED_LANGUAGES.includes(name));

  // Get all directories in packages/mcp/src
  const mcpEntries = await readdir(PACKAGES_MCP_SRC_PATH, { withFileTypes: true });
  const mcpDirs = mcpEntries.filter(entry => entry.isDirectory()).map(entry => entry.name);

  // Assert that each core directory has a corresponding mcp directory
  for (const coreDir of coreDirs) {
    t.true(
      mcpDirs.includes(coreDir),
      `Language folder '${coreDir}' from packages/core should have a corresponding folder in packages/mcp/src`,
    );
  }
});

test('each mcp tools folder is registered in server.ts', async t => {
  // Get all directories in packages/mcp/src
  const mcpEntries = await readdir(PACKAGES_MCP_SRC_PATH, { withFileTypes: true });
  const mcpDirs = mcpEntries.filter(entry => entry.isDirectory()).map(entry => entry.name);

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
