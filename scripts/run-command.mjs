import { commandAndFlagsInput } from "./command-input.mjs";
import { runYarnCommandForLanguage } from "./execute-command.mjs";
import { languageInput } from "./language-input.mjs";

runYarnCommandForLanguage(languageInput, commandAndFlagsInput);
