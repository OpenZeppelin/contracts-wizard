import { commandAndFlagsInput } from "./command-input.mjs";
import { inLanguageFolderRunTYarnCommand } from "./execute-command.mjs";
import { languageInput } from "./language-input.mjs";

inLanguageFolderRunTYarnCommand(languageInput, commandAndFlagsInput);
