import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';
import { MCP, UI, checkMcpUiChangesets, uiChangesetsMissingMcp } from './check-mcp-ui-changeset.mjs';

const scriptPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'check-mcp-ui-changeset.mjs');

function changeset(id, packages) {
  return {
    id,
    releases: packages.map(name => ({ name, type: 'patch' })),
  };
}

test('uiChangesetsMissingMcp passes when ui and contracts-mcp are listed together', () => {
  assert.deepEqual(uiChangesetsMissingMcp([changeset('both', [UI, MCP])]), []);
});

test('uiChangesetsMissingMcp fails when ui is listed without contracts-mcp', () => {
  assert.deepEqual(uiChangesetsMissingMcp([changeset('ui-only', [UI])]), ['ui-only']);
});

test('uiChangesetsMissingMcp ignores contracts-mcp-only and unrelated packages', () => {
  assert.deepEqual(
    uiChangesetsMissingMcp([
      changeset('mcp-only', [MCP]),
      changeset('core', ['@openzeppelin/wizard']),
      changeset('both', [UI, MCP]),
    ]),
    [],
  );
});

async function withFixture(files, fn) {
  const dir = await mkdtemp(path.join(tmpdir(), 'check-mcp-ui-changeset-'));
  await mkdir(path.join(dir, '.changeset'));
  await writeFile(path.join(dir, '.changeset', 'config.json'), '{}\n');
  for (const [name, body] of Object.entries(files)) {
    await writeFile(path.join(dir, '.changeset', name), body);
  }
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

const bothFrontmatter = `---
'${UI}': patch
'${MCP}': patch
---

Both packages.
`;

const uiOnlyFrontmatter = `---
'${UI}': patch
---

UI only.
`;

const mcpOnlyFrontmatter = `---
'${MCP}': patch
---

MCP only.
`;

test('checkMcpUiChangesets reads fixture changesets', async () => {
  await withFixture({ 'both.md': bothFrontmatter, 'mcp-only.md': mcpOnlyFrontmatter }, async dir => {
    assert.equal(await checkMcpUiChangesets(dir), 0);
  });

  await withFixture({ 'ui-only.md': uiOnlyFrontmatter }, async dir => {
    const error = console.error;
    console.error = () => {};
    try {
      assert.equal(await checkMcpUiChangesets(dir), 1);
    } finally {
      console.error = error;
    }
  });
});

test('CLI exits 1 for a ui-only changeset', async () => {
  await withFixture({ 'ui-only.md': uiOnlyFrontmatter }, dir => {
    const result = spawnSync(process.execPath, [scriptPath], { cwd: dir, encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /ui-only\.md/);
    assert.match(result.stderr, /@openzeppelin\/contracts-mcp/);
  });
});

test('CLI exits 0 when ui and contracts-mcp are listed together', async () => {
  await withFixture({ 'both.md': bothFrontmatter }, dir => {
    const result = spawnSync(process.execPath, [scriptPath], { cwd: dir, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, '');
  });
});
