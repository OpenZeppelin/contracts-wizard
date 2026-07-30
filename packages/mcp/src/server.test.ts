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

function toKebabCase(value: string): string {
  return value
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

/** Tool names that do not follow `<language>-<kebab kind>`. */
const MCP_TOOL_NAME_OVERRIDES: Record<string, string> = {
  'solidity:RealWorldAsset': 'solidity-rwa',
  'confidential:ERC7984': 'erc7984',
  'uniswap-hooks:Hooks': 'uniswap-hooks',
};

function coreKindToToolName(language: string, kind: string): string {
  return MCP_TOOL_NAME_OVERRIDES[`${language}:${kind}`] ?? `${language}-${toKebabCase(kind)}`;
}

function kindsFromSource(source: string): string[] {
  return [...source.matchAll(/case '([^']+)'/g)]
    .map(match => match[1])
    .filter((kind): kind is string => kind !== undefined);
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

/**
 * Kind-level counterpart to the language check above, mirroring `each core kind has cli registry
 * entry` in packages/cli: a kind added to an existing core language must also get an MCP tool.
 * Languages are the core∩mcp intersection; a core language with no MCP folder at all is the first
 * test's job to report.
 */
test('each core kind has an mcp tool', async t => {
  for (const language of await listMcpLanguageDirs()) {
    const kindSource = await readFile(join(PACKAGES_CORE_PATH, language, 'src', 'kind.ts'), 'utf-8');
    const toolsDir = join(PACKAGES_MCP_SRC_PATH, language, 'tools');
    const toolFiles = (await readdir(toolsDir)).filter(name => name.endsWith('.ts') && !name.endsWith('.test.ts'));
    const toolSources = (await Promise.all(toolFiles.map(name => readFile(join(toolsDir, name), 'utf-8')))).join('\n');

    for (const kind of kindsFromSource(kindSource)) {
      const expectedTool = coreKindToToolName(language, kind);
      t.true(
        toolSources.includes(`'${expectedTool}'`),
        `Expected MCP tool '${expectedTool}' registered in ${language}/tools for core kind '${kind}'`,
      );
    }
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
