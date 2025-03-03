import { execSync } from 'child_process';

function validateLanguageInput(languageInput) {
  const validPathPattern = /^[a-zA-Z0-9-_]+$/;
  if (!validPathPattern.test(languageInput)) {
    throw new Error(`Invalid language input: ${languageInput}. Only alphanumeric characters, hyphens, and underscores are allowed.`);
  }
}

export function runYarnCommandForLanguage(languageInput, commandAndFlagsInput) {
  try {
    validateLanguageInput(languageInput);
    execSync(`yarn --cwd ./packages/core/${languageInput} ${commandAndFlagsInput}`, {
      stdio: 'inherit',
    });
  } catch (error) {
    console.error(`Error running ${commandAndFlagsInput} in ${languageInput}:`, error.message || error.stack || error);
    process.exit(1);
  }
}
