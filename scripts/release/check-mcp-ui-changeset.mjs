#!/usr/bin/env node

/**
 * MCP Apps HTML is built from the private `ui` package at publish time.
 * A `ui` release without `@openzeppelin/contracts-mcp` would version UI in-repo
 * and never publish the App bundles.
 *
 * `changeset status` already requires a `ui` changeset when UI sources change.
 * This check only closes the gap Changesets will not: every changeset that
 * releases `ui` must also release `@openzeppelin/contracts-mcp`.
 */

import getChangesets from '@changesets/read';

const UI = 'ui';
const MCP = '@openzeppelin/contracts-mcp';

const sinceRef = process.argv[2];
const changesets = await getChangesets(process.cwd(), sinceRef);
const missing = [];

for (const changeset of changesets) {
  const names = new Set(changeset.releases.map(release => release.name));
  if (names.has(UI) && !names.has(MCP)) {
    missing.push(changeset.id);
  }
}

if (missing.length === 0) {
  process.exit(0);
}

console.error(
  `These changesets release \`${UI}\` without \`${MCP}\`:\n` +
    missing.map(id => `  - .changeset/${id}.md`).join('\n') +
    `\n\nList both packages so MCP App HTML is published with the UI change.\n` +
    `Example frontmatter:\n` +
    `---\n'${UI}': patch\n'${MCP}': patch\n---`,
);
process.exit(1);
