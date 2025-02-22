import { getCommandAndFlagsInput } from "./command-input.mjs";
import { runYarnCommandForLanguage } from "./execute-command.mjs";
import { getAndCheckLanguageInput } from "./language-input.mjs";

runYarnCommandForLanguage(
  getAndCheckLanguageInput(),
  getCommandAndFlagsInput()
);
