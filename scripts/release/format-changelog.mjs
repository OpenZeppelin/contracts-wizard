#!/usr/bin/env node

// Adjusts the format of the changelog that changesets generates.

import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getSupportedLanguageInCoreSubfolder } from '../language-input.mjs';

function formatChangelog(dir) {
  console.log(`Formatting changelog for ${dir}...`);

  const changelogPath = join(dir, 'CHANGELOG.md');

  const changelog = readFileSync(changelogPath, 'utf8');

  // Groups:
  //  - 1: Pull Request Number and URL
  //  - 2: Changeset entry
  const RELEASE_LINE_REGEX = /^- (\[#.*?\]\(.*?\))?.*?! - (.*)$/gm;

  // Captures X.Y.Z or X.Y.Z-rc.W
  const VERSION_TITLE_REGEX = /^## (\d+\.\d+\.\d+(-rc\.\d+)?)$/gm;

  const formatted = changelog
    // Remove titles
    .replace(/^### Major Changes\n\n/gm, '')
    .replace(/^### Minor Changes\n\n/gm, '')
    .replace(/^### Patch Changes\n\n/gm, '')
    // Remove extra whitespace between items
    .replace(/^(- \[.*\n)\n(?=-)/gm, '$1')
    // Format each release line
    .replace(RELEASE_LINE_REGEX, (_, pr, entry) => (pr ? `- ${entry} (${pr})` : `- ${entry}`))
    // Add date to new version
    .replace(VERSION_TITLE_REGEX, `\n## $1 (${new Date().toISOString().split('T')[0]})`);

  writeFileSync(changelogPath, formatted);
}

const languageFolders = getSupportedLanguageInCoreSubfolder();
for (const languageFolder of languageFolders) {
  const languageFolderPath = join('./packages/core', languageFolder);
  formatChangelog(languageFolderPath);
}
formatChangelog('./packages/common');
formatChangelog('./packages/mcp');
