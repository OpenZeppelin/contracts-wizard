import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const scriptPath = path.join(path.dirname(fileURLToPath(import.meta.url)), 'check-mcp-ui-changeset.mjs');

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

function run(cwd) {
  return spawnSync(process.execPath, [scriptPath], { cwd, encoding: 'utf8' });
}

test('exits 0 when ui is listed with contracts-mcp, ignoring mcp-only and unrelated changesets', async () => {
  await withFixture(
    {
      'both.md': `---
'ui': patch
'@openzeppelin/contracts-mcp': patch
---

Both packages.
`,
      'mcp-only.md': `---
'@openzeppelin/contracts-mcp': patch
---

MCP only.
`,
      'core.md': `---
'@openzeppelin/wizard': patch
---

Unrelated package.
`,
    },
    dir => {
      const result = run(dir);
      assert.equal(result.status, 0, result.stderr);
      assert.equal(result.stderr, '');
    },
  );
});

test('exits 1 for a ui-only changeset', async () => {
  await withFixture(
    {
      'ui-only.md': `---
'ui': patch
---

UI only.
`,
    },
    dir => {
      const result = run(dir);
      assert.equal(result.status, 1);
      assert.match(result.stderr, /ui-only\.md/);
      assert.match(result.stderr, /@openzeppelin\/contracts-mcp/);
    },
  );
});
