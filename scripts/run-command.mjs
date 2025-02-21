import { getCommandAndFlagsInput } from "./command-input.mjs";
import { inLanguageFolderRunTYarnCommand } from "./execute-command.mjs";
import { getAndCheckLanguageInput } from "./language-input.mjs";

const languageInput = getAndCheckLanguageInput();
const commandAndFlagsInput = getCommandAndFlagsInput().join(" ");

inLanguageFolderRunTYarnCommand(languageInput, commandAndFlagsInput);
