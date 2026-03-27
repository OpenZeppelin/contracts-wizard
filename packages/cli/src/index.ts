#!/usr/bin/env node

import { generateHelp } from './cli-adapter';
import { registry } from './registry';

const args = process.argv.slice(2);
const command = args[0];

function isRegistryCommand(value: string): value is keyof typeof registry {
  return value in registry;
}

if (!command || command === '--help' || command === '-h') {
  const commands = Object.keys(registry);
  process.stdout.write(`Usage: npx @openzeppelin/contracts-cli <command> [options]

Commands:
  ${commands.join(', ')}

Run \`npx @openzeppelin/contracts-cli <command> --help\` for command-specific options.
`);
  process.exit(0);
}

if (!isRegistryCommand(command)) {
  process.stderr.write(`Unknown command: ${command}\n\nRun \`npx @openzeppelin/contracts-cli --help\` for available commands.\n`);
  process.exit(1);
}

const entry = registry[command];

const commandArgs = args.slice(1);

if (commandArgs.includes('--help') || commandArgs.includes('-h')) {
  process.stdout.write(generateHelp(command, entry.schema, entry.description) + '\n');
  process.exit(0);
}

try {
  process.stdout.write(entry.run(commandArgs));
} catch (e) {
  if (e instanceof Error) {
    process.stderr.write(`Error: ${e.message}\n`);
  } else {
    process.stderr.write(`Error: ${e}\n`);
  }
  process.exit(1);
}
