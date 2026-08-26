---
name: changeset
description: Add a changeset file for a package version bump
user_invocable: true
---

# Add Changeset

Create a changeset file in `.changeset/` for the specified package(s).

## Format

```markdown
---
'package-name': patch|minor|major
---

First line is a high-level summary without leading dash (PR number gets appended automatically).
- Additional detail line.
- Another detail line.
- **Breaking change**: Description of what breaks.
```

## Rules

1. **First line**: Write as a plain sentence, no leading dash. The release tooling appends the PR link to this line.
2. **Subsequent lines**: Start each line with a dash. These lines get 2 spaces prepended automatically during the release process, so they appear indented under the first line in CHANGELOG.md.
3. **Breaking changes**: Mark with **Breaking change** or **Breaking changes** (see format example above).
4. **File naming**: Use a short kebab-case description, e.g., `add-cli-package.md`, `move-schemas-to-common.md`.
5. **Multiple packages**: Multiple packages can share a changeset file with different bump levels in the frontmatter. Use separate files only when packages need unrelated descriptions.
6. **Bump levels**: Follow semver based on current package version. `x.y.z` (>=1.0.0): major for breaking, minor for features, patch for fixes. `0.x.y`: minor for breaking, patch for features/fixes. `0.0.x`: patch for everything.
7. **New unpublished packages**: Still need a changeset to bump the initial version in package.json and for the changes to appear in the resulting changelog.
8. **UI that ships in MCP Apps**: `ui` is private (versioned in-repo, not published to npm). MCP App HTML is built from `ui` when `@openzeppelin/contracts-mcp` is published, but only from the `packages/ui/src/mcp-apps/` bundle graph — the entries import the Wizard controls directly, not the web shells. Changes to modules reachable from `src/mcp-apps/` need **one changeset listing both** `ui` and `@openzeppelin/contracts-mcp`; never version `ui` without also listing `@openzeppelin/contracts-mcp`. Web-only UI needs **no changeset**: the `App.svelte` shells and modules imported only by them (e.g. `solidity/overrides.ts`, `solidity/remix.ts`, `common/post-config.ts`), plus Cairo Alpha and Polkadot. To decide, search `packages/ui/src/mcp-apps/` for imports of the changed modules. `changeset status` in CI still flags most `packages/ui/src` paths as needing a changeset, so a web-only UI PR gets the `ignore-changeset` label instead of a changeset.

## Steps

1. Determine which packages changed and what bump level each needs.
2. Review existing CHANGELOG.md for the package(s) to match tone and style.
3. Write the changeset file(s) to `.changeset/<descriptive-name>.md`.