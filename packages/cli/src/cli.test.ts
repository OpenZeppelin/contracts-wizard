import test from 'ava';
import { execFileSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { registry } from './registry';

const CLI = join(__dirname, '..', 'dist', 'index.js');
const PACKAGES_CORE_PATH = join(__dirname, '../../core');
const CLI_EXCLUDED_LANGUAGES = ['cairo_alpha'];

function run(...args: string[]): string {
  return execFileSync('node', [CLI, ...args], { encoding: 'utf-8' });
}

function toKebabCase(value: string): string {
  return value
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .toLowerCase();
}

function kindsFromSource(source: string): string[] {
  return [...source.matchAll(/case '([^']+)'/g)]
    .map(match => match[1])
    .filter((kind): kind is string => kind !== undefined);
}

function coreKindToCommand(language: string, kind: string): string {
  if (language === 'uniswap-hooks' && kind === 'Hooks') {
    return language;
  }

  if (language === 'solidity' && kind === 'RealWorldAsset') {
    return 'solidity-rwa';
  }

  return `${language}-${toKebabCase(kind)}`;
}

// --- Top-level help ---

test('--help includes expected commands (smoke test)', t => {
  const output = run('--help');
  t.true(output.includes('solidity-erc20'));
  t.true(output.includes('cairo-erc20'));
  t.true(output.includes('stellar-fungible'));
  t.true(output.includes('stylus-erc20'));
  t.true(output.includes('confidential-erc7984'));
  t.true(output.includes('uniswap-hooks'));
});

test('each core kind has cli registry entry', async t => {
  const coreEntries = await readdir(PACKAGES_CORE_PATH, { withFileTypes: true });
  const coreDirs = coreEntries
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .filter(name => !CLI_EXCLUDED_LANGUAGES.includes(name));

  for (const coreDir of coreDirs) {
    const kindSource = await readFile(join(PACKAGES_CORE_PATH, coreDir, 'src', 'kind.ts'), 'utf-8');

    for (const kind of kindsFromSource(kindSource)) {
      const expectedCommand = coreKindToCommand(coreDir, kind);

      t.true(
        expectedCommand in registry,
        `Expected '${expectedCommand}' not found in registry for core language '${coreDir}' and kind '${kind}'`,
      );
    }
  }
});

// --- Help snapshots ---

test('--help snapshot', t => {
  t.snapshot(run('--help'));
});

for (const command of Object.keys(registry)) {
  test(`${command} --help snapshot`, t => {
    t.snapshot(run(command, '--help'));
  });
}

// --- Error handling ---

test('unknown command exits with error', t => {
  t.throws(() => run('nonexistent-command'), { message: /Unknown command/ });
});

test('unknown option exits with error', t => {
  t.throws(() => run('solidity-erc20', '--name', 'TestToken', '--symbol', 'TST', '--notreal'), {
    message: /Unknown option: --notreal/,
  });
});

test('missing required option exits with error', t => {
  t.throws(() => run('solidity-erc20', '--name', 'TestToken'), {
    message: /symbol/i,
  });
});
