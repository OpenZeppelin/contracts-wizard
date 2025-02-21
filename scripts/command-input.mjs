export function getCommandAndFlagsInput() {
  const [, , _languageFolderName, ...commandAndFlags] = process.argv;

  if (commandAndFlags) return commandAndFlags;

  console.error("Please provide a command.");
  process.exit(1);
}
