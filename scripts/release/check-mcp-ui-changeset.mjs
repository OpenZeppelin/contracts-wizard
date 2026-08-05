#!/usr/bin/env node

/**
 * Fail if a changeset lists `ui` but not `@openzeppelin/contracts-mcp`.
 *
 * `ui` is private (in-repo version only). App HTML is published only as part of
 * contracts-mcp, so a ui-only changeset must not land.
 *
 * `changeset status` already requires a `ui` changeset when UI sources change.
 */

import path from 'node:path';
import { fileURLToPath } from 'node:url';
import getChangesets from '@changesets/read';

export const UI = 'ui';
export const MCP = '@openzeppelin/contracts-mcp';

export function uiChangesetsMissingMcp(changesets) {
  return changesets
    .filter(changeset => {
      const names = new Set(changeset.releases.map(release => release.name));
      return names.has(UI) && !names.has(MCP);
    })
    .map(changeset => changeset.id);
}

export async function checkMcpUiChangesets(cwd = process.cwd(), sinceRef = process.argv[2]) {
  const missing = uiChangesetsMissingMcp(await getChangesets(cwd, sinceRef));

  if (missing.length === 0) {
    return 0;
  }

  console.error(
    `These changesets version \`${UI}\` without \`${MCP}\`:\n` +
      missing.map(id => `  - .changeset/${id}.md`).join('\n') +
      `\n\nList both packages so MCP App HTML is published with the UI change.\n` +
      `Example frontmatter:\n` +
      `---\n'${UI}': patch\n'${MCP}': patch\n---`,
  );
  return 1;
}

const invokedAsCli = process.argv[1] !== undefined && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (invokedAsCli) {
  process.exit(await checkMcpUiChangesets());
}
