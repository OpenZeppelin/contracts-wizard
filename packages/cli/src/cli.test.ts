import test from 'ava';
import { execFileSync } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

import { erc20, stablecoin, buildGeneric, printContract, tronPrintProfile } from '@openzeppelin/wizard';
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
  t.snapshot(
    runError(
      'solidity-governor',
      '--name',
      'TestGov',
      '--delay',
      '1 day',
      '--period',
      '1 week',
      '--quorumPercent',
      'notanumber',
    ),
  );
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
  const output = run(
    'solidity-erc20',
    '--name',
    'TestToken',
    '--symbol',
    'TST',
    '--info.license',
    'Apache-2.0',
    '--info.securityContact',
    'test@test.com',
  );
  t.is(
    output,
    erc20.print({
      name: 'TestToken',
      symbol: 'TST',
      info: { license: 'Apache-2.0', securityContact: 'test@test.com' },
    }),
  );
});

// --- TRON ---

test('tron-trc20 rewrites ERC20 to TRC20', t => {
  const output = run('tron-trc20', '--name', 'TestToken', '--symbol', 'TST');
  t.is(output, printContract(buildGeneric({ kind: 'ERC20', name: 'TestToken', symbol: 'TST' }), tronPrintProfile));
  t.true(output.includes('TRC20'), 'output should contain TRC20');
  t.true(
    output.includes('@openzeppelin/tron-contracts/token/TRC20/TRC20.sol'),
    'output should import from @openzeppelin/tron-contracts',
  );
});

test('tron-trc721 rewrites ERC721 to TRC721', t => {
  const output = run('tron-trc721', '--name', 'TestNFT', '--symbol', 'TNFT');
  t.is(output, printContract(buildGeneric({ kind: 'ERC721', name: 'TestNFT', symbol: 'TNFT' }), tronPrintProfile));
  t.true(output.includes('TRC721'), 'output should contain TRC721');
});

test('tron-trc1155 rewrites ERC1155 to TRC1155', t => {
  const output = run('tron-trc1155', '--name', 'TestMulti', '--uri', 'ipfs://example/{id}');
  t.is(
    output,
    printContract(buildGeneric({ kind: 'ERC1155', name: 'TestMulti', uri: 'ipfs://example/{id}' }), tronPrintProfile),
  );
  t.true(output.includes('TRC1155'), 'output should contain TRC1155');
});

test('tron-trc20 caps pragma at 0.8.26', t => {
  const output = run('tron-trc20', '--name', 'TestToken', '--symbol', 'TST');
  t.true(output.includes('pragma solidity ^0.8.26;'), 'pragma should be capped at 0.8.26');
  t.false(output.includes('pragma solidity ^0.8.27'), 'pragma should not be 0.8.27 (above tron-solc max)');
});

test('tron-trc20 renames the library but never user name/symbol literals', t => {
  // A name and symbol that embed a token standard: only the inherited base is
  // renamed to TRC20; the user's deployed name() and symbol() are untouched.
  const output = run('tron-trc20', '--name', 'My ERC20 Token', '--symbol', 'ERC20');
  t.true(output.includes('contract MyERC20Token is TRC20'), 'base renamed, contract name kept');
  t.true(output.includes('TRC20("My ERC20 Token", "ERC20")'), 'name/symbol literals preserved');
});
