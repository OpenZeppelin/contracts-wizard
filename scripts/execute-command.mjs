import { execSync } from "child_process";

export function runYarnCommandForLanguage(
  languageInput,
  commandAndFlagsInput
) {
  try {
    execSync(
      `yarn --cwd ./packages/core/${languageInput} ${commandAndFlagsInput}`,
      {
        stdio: "inherit",
      }
    );
  } catch (error) {
    console.error(
      `Error running ${commandAndFlagsInput} in ${languageInput}:`,
      error
    );
    process.exit(1);
  }
}
