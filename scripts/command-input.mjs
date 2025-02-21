const coreSubfolderPath = "./packages/core";

export function getCommandAndFlagsInput() {
  const [, , languageFolderName, ...commandAndFlags] = process.argv;

  if (commandAndFlags) return commandAndFlags;

  console.error("Please provide a command.");
  process.exit(1);
}

export const commandAndFlagsInput = getCommandAndFlagsInput().join(" ");
