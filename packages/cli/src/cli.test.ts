import test from 'ava';
import { execFileSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { erc20, stablecoin } from '@openzeppelin/wizard';
import { registry } from './registry';

const CLI = join(__dirname, '..', 'dist', 'index.js');
const PACKAGES_CORE_PATH = join(__dirname, '../../core');
const CLI_EXCLUDED_LANGUAGES = ['cairo_alpha'];

function run(...args: string[]): string {
  return execFileSync('node', [CLI, ...args], { encoding: 'utf-8' });
}

function runError(...args: string[]): string {
  try {
    execFileSync('node', [CLI, ...args], { encoding: 'utf-8' });
    throw new Error('Expected command to fail');
  } catch (e: unknown) {
    const error = e as { stderr?: string };
    return error.stderr ?? '';
  }
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

// --- Registry completeness ---

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

test('no args', t => {
  t.snapshot(run());
});

test('--help', t => {
  t.snapshot(run('--help'));
});

for (const command of Object.keys(registry)) {
  test(`${command} --help`, t => {
    t.snapshot(run(command, '--help'));
  });
}

// --- Error snapshots ---

test('unknown command', t => {
  t.snapshot(runError('nonexistent-command'));
});

test('unknown option', t => {
  t.snapshot(runError('solidity-erc20', '--name', 'TestToken', '--symbol', 'TST', '--notreal'));
});

test('missing required option', t => {
  t.snapshot(runError('solidity-erc20', '--name', 'TestToken'));
});

test('missing multiple required options', t => {
  t.snapshot(runError('solidity-erc20'));
});

test('unexpected argument without --', t => {
  t.snapshot(runError('solidity-erc20', 'foo'));
});

test('missing value for string option (followed by another flag)', t => {
  t.snapshot(runError('solidity-erc20', '--name', '--symbol', 'TST'));
});

test('missing value for string option (at end of args)', t => {
  t.snapshot(runError('solidity-erc20', '--symbol', 'TST', '--name'));
});

test('invalid enum value', t => {
  t.snapshot(runError('solidity-erc20', '--name', 'TestToken', '--symbol', 'TST', '--votes', 'invalidvalue'));
});

test('invalid number value', t => {
  t.snapshot(runError('solidity-governor', '--name', 'TestGov', '--delay', '1 day', '--period', '1 week', '--quorumPercent', 'notanumber'));
});

test('duplicate flag', t => {
  t.snapshot(runError('solidity-erc20', '--name', 'First', '--symbol', 'TST', '--name', 'Second'));
});

// --- Parsing ---

test('--flag=value syntax', t => {
  const output = run('solidity-erc20', '--name=TestToken', '--symbol=TST', '--votes=blocknumber');
  t.is(output, erc20.print({ name: 'TestToken', symbol: 'TST', votes: 'blocknumber' }));
});

test('--bool=true and --bool=false syntax', t => {
  const output = run('solidity-erc20', '--name', 'TestToken', '--symbol', 'TST', '--mintable=true', '--pausable=false');
  t.is(output, erc20.print({ name: 'TestToken', symbol: 'TST', mintable: true, pausable: false }));
});

test('bare --bool at end of args', t => {
  const output = run('solidity-erc20', '--name', 'TestToken', '--symbol', 'TST', '--mintable');
  t.is(output, erc20.print({ name: 'TestToken', symbol: 'TST', mintable: true }));
});

test('enum string value', t => {
  const output = run('solidity-erc20', '--name', 'TestToken', '--symbol', 'TST', '--access', 'ownable');
  t.is(output, erc20.print({ name: 'TestToken', symbol: 'TST', access: 'ownable' }));
});

test('false literal enum value', t => {
  const output = run('solidity-stablecoin', '--name', 'TestStable', '--symbol', 'TSTB', '--restrictions', 'false');
  t.is(output, stablecoin.print({ name: 'TestStable', symbol: 'TSTB', restrictions: false }));
});

test('string values with spaces', t => {
  const output = run('solidity-erc20', '--name', 'My Token', '--symbol', 'TST');
  t.is(output, erc20.print({ name: 'My Token', symbol: 'TST' }));
});

test('nested dot options with multiple fields', t => {
  const output = run('solidity-erc20', '--name', 'TestToken', '--symbol', 'TST', '--info.license', 'Apache-2.0', '--info.securityContact', 'test@test.com');
  t.is(output, erc20.print({ name: 'TestToken', symbol: 'TST', info: { license: 'Apache-2.0', securityContact: 'test@test.com' } }));
});
