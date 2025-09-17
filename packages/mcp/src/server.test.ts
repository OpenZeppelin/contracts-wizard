import test from 'ava';
import { readdir } from 'fs/promises';
import { join } from 'path';
import { readFile } from 'fs/promises';

const PACKAGES_CORE_PATH = join(__dirname, '../../core');
const PACKAGES_MCP_SRC_PATH = join(__dirname);
const SERVER_TS_PATH = join(__dirname, 'server.ts');

test('each language folder in packages/core has a corresponding folder in packages/mcp/src (except cairo_alpha)', async (t) => {
  // Get all directories in packages/core
  const coreEntries = await readdir(PACKAGES_CORE_PATH, { withFileTypes: true });
  const coreDirs = coreEntries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => name !== 'cairo_alpha'); // Skip cairo_alpha as requested

  // Get all directories in packages/mcp/src
  const mcpEntries = await readdir(PACKAGES_MCP_SRC_PATH, { withFileTypes: true });
  const mcpDirs = mcpEntries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  // Assert that each core directory (except cairo_alpha) has a corresponding mcp directory
  for (const coreDir of coreDirs) {
    t.true(
      mcpDirs.includes(coreDir),
      `Language folder '${coreDir}' from packages/core should have a corresponding folder in packages/mcp/src`
    );
  }

  // Log the directories for debugging
  t.log('Core directories (excluding cairo_alpha):', coreDirs.sort());
  t.log('MCP directories:', mcpDirs.sort());
});

test('each folder in packages/mcp/src is registered as a language in server.ts', async (t) => {
  // Get all directories in packages/mcp/src
  const mcpEntries = await readdir(PACKAGES_MCP_SRC_PATH, { withFileTypes: true });
  const mcpDirs = mcpEntries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name);

  // Read server.ts content
  const serverContent = await readFile(SERVER_TS_PATH, 'utf-8');

  // For each directory, check if there's a corresponding register function call
  for (const mcpDir of mcpDirs) {
    const expectedImport = `import { register${capitalize(mcpDir)}Tools } from './${mcpDir}/tools.js';`;
    const expectedRegistration = `register${capitalize(mcpDir)}Tools(server);`;

    t.true(
      serverContent.includes(expectedImport),
      `Expected import statement '${expectedImport}' not found in server.ts for language '${mcpDir}'`
    );

    t.true(
      serverContent.includes(expectedRegistration),
      `Expected registration call '${expectedRegistration}' not found in server.ts for language '${mcpDir}'`
    );
  }

  // Log the directories for debugging
  t.log('MCP directories found:', mcpDirs.sort());
  t.log('Server.ts imports and registrations checked');
});

/**
 * Capitalizes the first letter of a string
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
