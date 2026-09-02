import test from 'ava';
import { readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { readFile } from 'fs/promises';
import { TOOL_APP_SPECS } from './apps/register';

const PACKAGES_CORE_PATH = join(__dirname, '../../core');
const PACKAGES_MCP_SRC_PATH = join(__dirname);
const PACKAGES_UI_MCP_ENTRIES = join(__dirname, '../../ui/src/mcp-apps/entries');
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

/** Tool names that do not follow `<language>-<kebab kind>`, as documented in the README. */
const MCP_TOOL_NAME_OVERRIDES: Record<string, string> = {
  'solidity:RealWorldAsset': 'solidity-rwa',
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

/**
 * Expected MCP App tools: core kinds for languages that have packages/core/<lang>,
 * plus TRON tools actually registered under packages/mcp/src/tron/tools.
 */
async function listExpectedWizardTools(): Promise<{ language: string; kind: string; toolName: string }[]> {
  const expected: { language: string; kind: string; toolName: string }[] = [];
  for (const language of await listMcpLanguageDirs()) {
    const kindSource = await readFile(join(PACKAGES_CORE_PATH, language, 'src', 'kind.ts'), 'utf-8');
    for (const kind of kindsFromSource(kindSource)) {
      expected.push({ language, kind, toolName: coreKindToToolName(language, kind) });
    }
  }
  // TRON has no packages/core/tron (it prints Solidity builders through
  // tronPrintProfile), so its tools cannot be derived from kind.ts. Read them from
  // the tool sources instead: a missing TOOL_APP_SPECS entry already throws at
  // registration, but nothing else checks that the entry's `kind` matches the kind
  // the tool actually builds — a mismatch silently ships an app UI for the wrong kind.
  expected.push(...(await listRegisteredTronTools()));
  return expected;
}

async function listRegisteredTronTools(): Promise<{ language: string; kind: string; toolName: string }[]> {
  const toolsDir = join(PACKAGES_MCP_SRC_PATH, 'tron', 'tools');
  const files = (await readdir(toolsDir)).filter(name => name.endsWith('.ts') && !name.endsWith('.test.ts'));
  return Promise.all(
    files.map(async name => {
      const src = await readFile(join(toolsDir, name), 'utf-8');
      const toolName = src.match(/registerWizardAppTool\s*\(\s*\w+\s*,\s*'([^']+)'/)?.[1];
      const kind = src.match(/\bkind:\s*'([^']+)' as const/)?.[1];
      if (toolName === undefined || kind === undefined) {
        throw new Error(`Could not parse registerWizardAppTool name and kind from ${join(toolsDir, name)}`);
      }
      return { language: 'tron', kind, toolName };
    }),
  );
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
 * The README is what npm renders for the package, so a language shipped without
 * a row in its table is invisible to anyone browsing the npm page (TRON was
 * initially missed this way).
 */
test('each mcp language has a README table row listing its tools', async t => {
  const readme = await readFile(join(__dirname, '..', 'README.md'), 'utf-8');
  const byLanguage = new Map<string, string[]>();

  for (const { language, toolName } of await listExpectedWizardTools()) {
    const suffix = toolName.startsWith(`${language}-`) ? toolName.slice(language.length + 1) : toolName;
    byLanguage.set(language, [...(byLanguage.get(language) ?? []), suffix]);
  }

  for (const [language, suffixes] of byLanguage) {
    const row = readme.split('\n').find(line => line.startsWith(`| ${language} |`));

    t.truthy(row, `packages/mcp/README.md language table is missing a row for '${language}'`);
    if (row === undefined) continue;

    for (const suffix of suffixes) {
      t.true(row.includes(suffix), `README table row for '${language}' is missing '${suffix}'`);
    }
  }
});

/**
 * Kind-level counterpart to the language check above, mirroring `each core kind has cli registry
 * entry` in packages/cli: a kind added to an existing core language must also get an MCP tool.
 * Languages are the core∩mcp intersection; a core language with no MCP folder at all is the first
 * test's job to report.
 *
 * Also requires that tool to be registered via `registerWizardAppTool` (not a bare `registerTool`),
 * so MCP App UI cannot be skipped while still satisfying name/map checks.
 */
test('each core kind has an mcp tool', async t => {
  for (const language of await listMcpLanguageDirs()) {
    const kindSource = await readFile(join(PACKAGES_CORE_PATH, language, 'src', 'kind.ts'), 'utf-8');
    const toolsDir = join(PACKAGES_MCP_SRC_PATH, language, 'tools');
    const toolFiles = (await readdir(toolsDir)).filter(name => name.endsWith('.ts') && !name.endsWith('.test.ts'));
    const toolFileSources = await Promise.all(
      toolFiles.map(async name => [name, await readFile(join(toolsDir, name), 'utf-8')] as const),
    );

    for (const kind of kindsFromSource(kindSource)) {
      const expectedTool = coreKindToToolName(language, kind);
      const definingFile = toolFileSources.find(([, src]) => src.includes(`'${expectedTool}'`));
      t.truthy(
        definingFile,
        `Expected MCP tool '${expectedTool}' registered in ${language}/tools for core kind '${kind}'`,
      );
      t.true(
        definingFile![1].includes('registerWizardAppTool'),
        `Expected '${expectedTool}' in ${language}/tools/${definingFile![0]} to use registerWizardAppTool so MCP App UI is wired`,
      );
      t.true(
        new RegExp(String.raw`registerWizardAppTool\s*\(\s*\w+\s*,\s*'${expectedTool}'`).test(definingFile![1]),
        `Expected registerWizardAppTool(..., '${expectedTool}', ...) in ${language}/tools/${definingFile![0]}`,
      );
    }
  }
});

/**
 * MCP Apps kind injection depends on TOOL_APP_SPECS. Keep it in lockstep with core kinds and
 * UI language entries — a new kind/language must update the map and add entries/<language>.ts,
 * or this fails in CI before publish.
 */
test('TOOL_APP_SPECS matches every core kind and UI language entry', async t => {
  const expectedTools = await listExpectedWizardTools();
  const expectedNames = expectedTools.map(e => e.toolName).sort();
  const actualNames = Object.keys(TOOL_APP_SPECS).sort();

  t.deepEqual(
    actualNames,
    expectedNames,
    'TOOL_APP_SPECS keys must equal core-derived MCP tool names (add/remove map entries when kinds change)',
  );

  for (const { language, kind, toolName } of expectedTools) {
    const spec = TOOL_APP_SPECS[toolName];
    if (spec === undefined) {
      t.fail(`TOOL_APP_SPECS missing '${toolName}'`);
      continue;
    }
    t.is(String(spec.template), language, `${toolName} template must be language '${language}'`);
    t.is(spec.kind, kind, `${toolName} kind must be '${kind}'`);
  }

  const templates = [...new Set(Object.values(TOOL_APP_SPECS).map(s => s.template))].sort();
  for (const template of templates) {
    const entryPath = join(PACKAGES_UI_MCP_ENTRIES, `${template}.ts`);
    t.true(existsSync(entryPath), `MCP App UI entry missing for template '${template}' (expected ${entryPath})`);
  }

  const entryFiles = (await readdir(PACKAGES_UI_MCP_ENTRIES))
    .filter(name => name.endsWith('.ts'))
    .map(name => name.replace(/\.ts$/, ''))
    .sort();
  t.deepEqual(
    entryFiles,
    templates,
    'packages/ui/src/mcp-apps/entries must match TOOL_APP_SPECS templates exactly (no stale or missing language entries)',
  );
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
