import { readdirSync, statSync } from 'fs';
import { join } from 'path';

const coreSubfolderPath = './packages/core';

export function getSupportedLanguageInCoreSubfolder() {
  return readdirSync(coreSubfolderPath).filter(subfolder => {
    const subfolderPath = join(coreSubfolderPath, subfolder);
    return statSync(subfolderPath).isDirectory();
  });
}

function getLanguageInput() {
  const [, , languageFolderName] = process.argv;

  if (languageFolderName) return languageFolderName;

  console.error('Please provide a language name.');
  process.exit(1);
}

export function getAndCheckLanguageInput() {
  const languageFolderName = getLanguageInput();

  const supportedLanguages = getSupportedLanguageInCoreSubfolder();

  if (supportedLanguages.includes(languageFolderName)) return languageFolderName;

  console.error(`Invalid language name ${languageFolderName}. Supported languages: ${supportedLanguages.join(', ')}`);
  process.exit(1);
}
