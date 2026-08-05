#!/usr/bin/env node

/**
 * Fail if a changeset lists `ui` but not `@openzeppelin/contracts-mcp`.
 *
 * `ui` is private (in-repo version only). App HTML is published only as part of
 * contracts-mcp, so a ui-only changeset must not land.
 *
 * `changeset status` already requires a `ui` changeset when UI sources change.
 */

import getChangesets from '@changesets/read';

const UI = 'ui';
const MCP = '@openzeppelin/contracts-mcp';
const sinceRef = process.argv[2];
const missing = [];

for (const changeset of await getChangesets(process.cwd(), sinceRef)) {
  const names = new Set(changeset.releases.map(release => release.name));
  if (names.has(UI) && !names.has(MCP)) {
    missing.push(changeset.id);
  }
}

if (missing.length === 0) {
  process.exit(0);
}

console.error(
  `These changesets version \`${UI}\` without \`${MCP}\`:\n` +
    missing.map(id => `  - .changeset/${id}.md`).join('\n') +
    `\n\nList both packages so MCP App HTML is published with the UI change.\n` +
    `Example frontmatter:\n` +
    `---\n'${UI}': patch\n'${MCP}': patch\n---`,
);
process.exit(1);
