#!/usr/bin/env node

import { generateHelp } from './cli-adapter';
import { registry } from './registry';

const [command, ...commandArgs] = process.argv.slice(2);

if (!command || command === '--help' || command === '-h') {
  process.stdout.write(`Usage: npx @openzeppelin/contracts-cli <command> [options]

Commands:
  ${Object.keys(registry).join(', ')}

Generated contract source code is printed to stdout.

Run \`npx @openzeppelin/contracts-cli <command> --help\` for command-specific options.
`);
  process.exit(0);
}

if (!(command in registry)) {
  process.stderr.write(`Unknown command: ${command}

Run \`npx @openzeppelin/contracts-cli --help\` for available commands.
`);
  process.exit(1);
}

const entry = registry[command as keyof typeof registry];

if (commandArgs.includes('--help') || commandArgs.includes('-h')) {
  process.stdout.write(generateHelp(command, entry.schema, entry.description) + '\n');
  process.exit(0);
}

try {
  process.stdout.write(entry.run(commandArgs));
} catch (e) {
  const message = e instanceof Error ? e.message : String(e);
  process.stderr.write(`Error in '${command}': ${message}\n`);
  process.exit(1);
}
