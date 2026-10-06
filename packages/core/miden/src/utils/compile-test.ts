import type { ExecutionContext } from 'ava';
import { execFile } from 'child_process';
import { mkdir, mkdtemp, rm, writeFile } from 'fs/promises';
import os from 'os';
import path from 'path';
import { promisify } from 'util';

import type { GenericOptions } from '../build-generic';
import { buildGeneric } from '../build-generic';
import { generateSources, writeGeneratedSources } from '../generate/sources';
import { printContract } from '../print';
import { contractsVersion } from './version';

const asyncExecFile = promisify(execFile);

/** Rust toolchain pinned by the Miden protocol repository at the `contractsVersion` release. */
export const RUST_TOOLCHAIN = '1.98.1';

const RUST_EDITION = '2024';

/**
 * Options whose string constants have characters that a Rust string literal must escape or that would not show in
 * the source, and a decomposed accent, which Unicode normalization would change. The option matrix only has plain
 * text.
 */
const SPECIAL_CHARACTERS_OPTIONS: GenericOptions = {
  kind: 'Fungible',
  name: 'Caf\u00e9 "Coin" \\ \u{1fa99}',
  symbol: 'CAFE',
  description:
    'Quote " backslash \\ newline \n return \r tab \t null \u0000 line separator \u2028 no-break space \u00a0 ' +
    'zero-width space \u200b override \u202e isolate \u2066 pop \u2069 joined \u{1f468}\u200d\u{1f469} ' +
    'decomposed e\u0301 BOM \ufeff',
};

/** Target directory shared across runs, so that the protocol dependencies are compiled once and can be cached in CI. */
function cargoTargetDir(): string {
  return process.env.MIDEN_CARGO_TARGET_DIR ?? path.resolve(__dirname, '..', '..', 'target');
}

/** Runs `fn` in a temporary crate directory that is removed afterwards. */
export async function withTemporaryCrate(fn: (dir: string) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'wizard-miden-compile-'));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** A generated source compiled as a module of the test crate. */
export interface CompiledSource {
  /** Module name, which is also the name of the test building the account. */
  module: string;
  /** Name of the generated struct. */
  identifier: string;
  source: string;
  /** Values of the string constants, by constant name, as given in the options. */
  strings: Record<string, string>;
}

/**
 * Writes a crate depending on the published protocol crates of `contractsVersion`, with one module per generated
 * source. Every item of the generated sources is public, so denying warnings turns unused imports into failures.
 * The crate's test calls `create` on every faucet, which catches combinations of components that the library
 * rejects when building the account. It runs no transaction and needs no node. It also checks that every string
 * constant has the bytes of the option it was printed from.
 */
export async function writeCrate(dir: string, sources: CompiledSource[]): Promise<void> {
  const version = `"=${contractsVersion}"`;
  await writeFile(
    path.join(dir, 'Cargo.toml'),
    [
      '[package]',
      'name = "wizard-miden-compile-test"',
      `version = "${contractsVersion}"`,
      `edition = "${RUST_EDITION}"`,
      'publish = false',
      '',
      '[dependencies]',
      `miden-protocol = ${version}`,
      `miden-standards = ${version}`,
      '',
      '[dev-dependencies]',
      `miden-protocol = { version = ${version}, features = ["testing"] }`,
      '',
      '[workspace]',
      '',
    ].join('\n'),
  );
  await writeFile(
    path.join(dir, 'rust-toolchain.toml'),
    ['[toolchain]', `channel = "${RUST_TOOLCHAIN}"`, 'components = ["rustfmt"]', 'profile = "minimal"', ''].join('\n'),
  );

  const src = path.join(dir, 'src');
  await mkdir(src, { recursive: true });
  const sorted = [...sources].sort((a, b) => a.module.localeCompare(b.module));
  await writeFile(
    path.join(src, 'lib.rs'),
    ['#![deny(warnings)]', '', ...sorted.map(({ module }) => `pub mod ${module};`), ''].join('\n'),
  );
  for (const { module, source } of sorted) {
    await writeFile(path.join(src, `${module}.rs`), source);
  }

  const tests = path.join(dir, 'tests');
  await mkdir(tests, { recursive: true });
  await writeFile(path.join(tests, 'build_accounts.rs'), buildAccountsTest(sorted));
}

function buildAccountsTest(sources: CompiledSource[]): string {
  const lines = [
    '//! Builds every generated faucet account in memory. No node, no transactions.',
    '',
    'use miden_protocol::account::auth::{AuthSecretKey, PublicKey};',
    'use miden_protocol::account::{AccountId, AccountIdVersion, AccountType, AssetCallbackFlag};',
    'use wizard_miden_compile_test::*;',
    '',
    '#[allow(dead_code)]',
    'fn id(byte: u8) -> AccountId {',
    '    AccountId::dummy([byte; 15], AccountIdVersion::Version1, AccountType::Public, AssetCallbackFlag::Disabled)',
    '}',
    '',
    '#[allow(dead_code)]',
    'fn key() -> PublicKey {',
    '    AuthSecretKey::new_falcon512_poseidon2().public_key()',
    '}',
  ];
  for (const { module, identifier, source, strings } of sources) {
    const args = createArguments(source).join(', ');
    const checks = Object.entries(strings).map(([constant, value]) => {
      const bytes = [...new TextEncoder().encode(value)].join(', ');
      return `    assert_eq!(${module}::${identifier}::${constant}.as_bytes(), [${bytes}]);`;
    });
    lines.push(
      '',
      '#[test]',
      `fn ${module}() {`,
      ...checks,
      `    ${module}::${identifier}::create(${args}).expect("account builds");`,
      '}',
    );
  }
  lines.push('');
  return lines.join('\n');
}

/**
 * Every variant of the option matrix that differs in code structure, once per distinct output, plus
 * `SPECIAL_CHARACTERS_OPTIONS`.
 */
export function sourcesToCompile(): CompiledSource[] {
  const sources: CompiledSource[] = [];
  const printed = new Set<string>();
  for (const { options, contract, source } of generateSources()) {
    // Options that the builder ignores or overrides print the same source as other variants.
    if (!isCompiledVariant(options) || printed.has(source)) {
      continue;
    }
    printed.add(source);
    sources.push({
      module: `variant${sources.length + 1}`,
      identifier: contract.name.identifier,
      source,
      strings: stringConstants(options),
    });
  }
  const contract = buildGeneric(SPECIAL_CHARACTERS_OPTIONS);
  sources.push({
    module: 'special_characters',
    identifier: contract.name.identifier,
    source: printContract(contract),
    strings: stringConstants(SPECIAL_CHARACTERS_OPTIONS),
  });
  return sources;
}

/**
 * Whether the compile test builds the variant. It leaves out variants that differ only in text: the metadata fields
 * are either all set or all empty, since each one only adds its own constant and builder call, and no info is set,
 * since the license and security contact are only printed in comments.
 */
function isCompiledVariant(options: GenericOptions): boolean {
  const link = options.kind === 'Fungible' ? options.externalLink : options.contractUri;
  const metadata = [options.description, options.logoUri, link];
  const allOrNone = metadata.every(field => field) || metadata.every(field => !field);
  return allOrNone && Object.keys(options.info ?? {}).length === 0;
}

/** The string constants printed for the options, by constant name. An empty metadata field has no constant. */
function stringConstants(options: GenericOptions): Record<string, string> {
  const link =
    options.kind === 'Fungible' ? { EXTERNAL_LINK: options.externalLink } : { CONTRACT_URI: options.contractUri };
  const constants: Record<string, string | undefined> = {
    NAME: options.name,
    SYMBOL: options.symbol,
    DESCRIPTION: options.description,
    LOGO_URI: options.logoUri,
    ...link,
  };
  return Object.fromEntries(
    Object.entries(constants).filter((entry): entry is [string, string] => entry[1] !== undefined && entry[1] !== ''),
  );
}

/** Test values for the arguments of the generated `create` function, read from its signature. */
function createArguments(source: string): string[] {
  const signature = /pub fn create\(([^)]*)\)/.exec(source)?.[1];
  if (signature === undefined) {
    throw new Error('Generated source has no `create` function');
  }
  let accountIds = 0;
  return signature
    .split(',')
    .map(param => param.split(':')[1]?.trim())
    .filter(type => type !== undefined && type !== '')
    .map(type => {
      switch (type) {
        case '[u8; 32]':
          return '[7; 32]';
        case 'AccountId':
          accountIds += 1;
          return `id(${accountIds})`;
        case 'PublicKey':
          return 'key()';
        case 'AccountType':
          return 'AccountType::Public';
        default:
          throw new Error(`Unexpected argument type of \`create\`: ${type}`);
      }
    });
}

/** Compiles the crate and builds every account by running its test. */
export async function cargoTest(t: ExecutionContext, dir: string): Promise<void> {
  try {
    await asyncExecFile('cargo', ['test', '--quiet'], {
      cwd: dir,
      // The crate is in a new temporary directory every run, so its incremental compilation data is never reused.
      env: { ...process.env, CARGO_TARGET_DIR: cargoTargetDir(), CARGO_INCREMENTAL: '0' },
      maxBuffer: 64 * 1024 * 1024,
    });
    t.pass();
  } catch (e: unknown) {
    const { stdout, stderr } = e as { stdout?: string; stderr?: string };
    t.fail(`cargo test failed:\n${stderr ?? String(e)}\n${stdout ?? ''}`);
  }
}

/** Checks that the generated sources are already formatted the way `rustfmt` would format them. */
export async function rustfmtCheck(t: ExecutionContext, dir: string, files: string[]): Promise<void> {
  const batchSize = 200;
  const concurrency = 4;
  const batches: string[][] = [];
  for (let i = 0; i < files.length; i += batchSize) {
    batches.push(files.slice(i, i + batchSize));
  }
  const failures: string[] = [];
  const worker = async () => {
    for (let batch = batches.shift(); batch !== undefined; batch = batches.shift()) {
      try {
        await asyncExecFile('rustfmt', ['--edition', RUST_EDITION, '--check', ...batch], {
          cwd: dir,
          maxBuffer: 64 * 1024 * 1024,
        });
      } catch (e: unknown) {
        const { stdout, stderr } = e as { stdout?: string; stderr?: string };
        failures.push(stdout || stderr || String(e));
      }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  if (failures.length > 0) {
    t.fail(`rustfmt would reformat generated sources:\n${failures.join('\n')}`);
  } else {
    t.pass();
  }
}

/** Writes every variant of the option matrix into `dir/all` and returns the file paths, relative to `dir`. */
export async function writeAllVariants(dir: string): Promise<string[]> {
  const names = await writeGeneratedSources(path.join(dir, 'all'), false);
  return names.map(name => path.join('all', `${name}.rs`));
}
