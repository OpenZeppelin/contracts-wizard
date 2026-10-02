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

/** Fully featured configurations compiled in addition to the covering subset of the option matrix. */
export const featuredOptions: Record<string, GenericOptions> = {
  full_single_key_token: {
    kind: 'Fungible',
    name: 'FullSingleKeyToken',
    symbol: 'FSKT',
    decimals: '6',
    maxSupply: '1000000',
    description: 'A token',
    logoUri: 'https://example.com/logo.png',
    externalLink: 'https://example.com',
    updatableMetadata: true,
    updatableMaxSupply: true,
    burnPolicy: 'minimumAmount',
    minBurnAmount: '0.5',
    pausable: true,
    transferPolicy: 'allowlist',
    switchableTransferPolicy: true,
    access: 'singleKey',
  },
  full_ownable_token: {
    kind: 'Fungible',
    name: 'FullOwnableToken',
    symbol: 'FOT',
    burnPolicy: 'ownerOnly',
    updatableMetadata: true,
    updatableMaxSupply: true,
    pausable: true,
    pausableTransfers: true,
    switchableTransferPolicy: true,
    access: 'ownable',
  },
  full_roles_token: {
    kind: 'Fungible',
    name: 'FullRolesToken',
    symbol: 'FRT',
    burnPolicy: 'minimumAmount',
    minBurnAmount: '1',
    updatableMetadata: true,
    updatableMaxSupply: true,
    pausable: true,
    transferPolicy: 'blocklist',
    switchableTransferPolicy: true,
    access: 'roles',
    info: { license: 'MIT', securityContact: 'security@example.com' },
  },
  full_single_key_collection: {
    kind: 'NonFungible',
    name: 'FullSingleKeyCollection',
    symbol: 'FSKC',
    description: 'A collection',
    logoUri: 'https://example.com/logo.png',
    contractUri: 'https://example.com/collection.json',
    updatableMetadata: true,
    pausable: true,
    pausableTransfers: true,
    switchableTransferPolicy: true,
    access: 'singleKey',
  },
  full_ownable_collection: {
    kind: 'NonFungible',
    name: 'FullOwnableCollection',
    symbol: 'FOC',
    updatableMetadata: true,
    pausable: true,
    transferPolicy: 'blocklist',
    access: 'ownable',
  },
  full_roles_collection: {
    kind: 'NonFungible',
    name: 'FullRolesCollection',
    symbol: 'FRC',
    burnPolicy: 'ownerOnly',
    updatableMetadata: true,
    pausable: true,
    transferPolicy: 'allowlist',
    switchableTransferPolicy: true,
    access: 'roles',
  },
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
  /** Whether `create` builds a Single Key user account rather than a network account. */
  singleKey: boolean;
  source: string;
}

/**
 * Writes a crate depending on the published protocol crates of `contractsVersion`, with one module per generated
 * source. Every item of the generated sources is public, so denying warnings turns unused imports into failures.
 * The crate's test calls `create` on every faucet, which catches combinations of components that the library
 * rejects when building the account. It runs no transaction and needs no node.
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
  for (const { module, identifier, singleKey } of sources) {
    const args = singleKey ? 'key(), AccountType::Public' : 'id(1), id(2)';
    lines.push(
      '',
      '#[test]',
      `fn ${module}() {`,
      `    ${module}::${identifier}::create([7; 32], ${args}).expect("account builds");`,
      '}',
    );
  }
  lines.push('');
  return lines.join('\n');
}

/** The covering subset of the option matrix (every `use` item at least once) plus the featured configurations. */
export function sourcesToCompile(): CompiledSource[] {
  const sources: CompiledSource[] = [];
  for (const { contract, options, source } of generateSources('minimal-cover', true)) {
    sources.push({
      module: contract.name.moduleName,
      identifier: contract.name.identifier,
      singleKey: isSingleKey(options),
      source,
    });
  }
  for (const [module, options] of Object.entries(featuredOptions)) {
    const contract = buildGeneric(options);
    sources.push({
      module,
      identifier: contract.name.identifier,
      singleKey: isSingleKey(options),
      source: printContract(contract),
    });
  }
  return sources;
}

/**
 * Whether `create` builds a Single Key faucet. The owner-only burn policy turns a requested Single Key faucet into an
 * Ownable one.
 */
function isSingleKey(options: GenericOptions): boolean {
  return (options.access ?? 'ownable') === 'singleKey' && options.burnPolicy !== 'ownerOnly';
}

/** Compiles the crate and builds every account by running its test. */
export async function cargoTest(t: ExecutionContext, dir: string): Promise<void> {
  try {
    await asyncExecFile('cargo', ['test', '--quiet'], {
      cwd: dir,
      env: { ...process.env, CARGO_TARGET_DIR: cargoTargetDir() },
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
  const names = await writeGeneratedSources(path.join(dir, 'all'), 'all', false);
  return names.map(name => path.join('all', `${name}.rs`));
}
