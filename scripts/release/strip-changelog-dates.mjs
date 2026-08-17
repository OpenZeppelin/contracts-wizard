#!/usr/bin/env node

// Removes the date suffix from version headings in all packages' changelogs,
// e.g. `## 1.2.3 (2026-08-17)` -> `## 1.2.3`, modifying the working tree only.
//
// The changesets GitHub Action creates GitHub releases by extracting the
// section of CHANGELOG.md whose level-2 heading exactly equals the published
// version. Our custom format appends a date to the heading, which breaks that
// match and causes the entire changelog to be used as the release notes.
// The action reads the changelogs from the working tree after the publish
// script completes, so stripping the dates here (uncommitted) lets it extract
// only the current version's section, while the committed changelogs and the
// published npm packages keep the dated format.

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const DATED_VERSION_TITLE_REGEX = /^## (\d+\.\d+\.\d+(?:-rc\.\d+)?) \(\d{4}-\d{2}-\d{2}\)$/gm;

function stripChangelogDates(dir) {
  const changelogPath = join(dir, 'CHANGELOG.md');
  if (!existsSync(changelogPath)) {
    return;
  }

  console.log(`Stripping dates from changelog for ${dir}...`);

  const changelog = readFileSync(changelogPath, 'utf8');
  writeFileSync(changelogPath, changelog.replace(DATED_VERSION_TITLE_REGEX, '## $1'));
}

for (const parent of ['./packages', './packages/core']) {
  for (const entry of readdirSync(parent, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      stripChangelogDates(join(parent, entry.name));
    }
  }
}
