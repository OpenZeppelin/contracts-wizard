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

/**
 * Commit of https://github.com/0xMiden/protocol that the generated code is compiled against. It must be a
 * commit of the release named by `contractsVersion`; bump both together when the target release changes.
 */
export const PROTOCOL_GIT_REV = '86f6f3cdbcc5dc2ee3b12cfc61932f780dd612ac';

/** Rust toolchain pinned by the protocol repository at `PROTOCOL_GIT_REV`. */
export const RUST_TOOLCHAIN = '1.98.1';

const RUST_EDITION = '2024';

/** Fully featured configurations compiled in addition to the covering subset of the option matrix. */
export const featuredOptions: Record<string, GenericOptions> = {
  full_user_token: {
    kind: 'Fungible',
    name: 'FullUserToken',
    symbol: 'FUT',
    decimals: '6',
    maxSupply: '1000000',
    description: 'A token',
    logoUri: 'https://example.com/logo.png',
    externalLink: 'https://example.com',
    updatableMetadata: true,
    updatableMaxSupply: true,
    minBurnAmount: '0.5',
    pausable: true,
    restrictions: 'allowlist',
    switchablePolicies: true,
  },
  full_ownable_token: {
    kind: 'Fungible',
    name: 'FullOwnableToken',
    symbol: 'FOT',
    burnable: false,
    updatableMetadata: true,
    updatableMaxSupply: true,
    pausable: true,
    restrictions: 'blocklist',
    switchablePolicies: true,
    access: 'ownable',
  },
  full_roles_token: {
    kind: 'Fungible',
    name: 'FullRolesToken',
    symbol: 'FRT',
    minBurnAmount: '1',
    updatableMetadata: true,
    updatableMaxSupply: true,
    pausable: true,
    restrictions: 'blocklist',
    switchablePolicies: true,
    access: 'roles',
    info: { license: 'MIT', securityContact: 'security@example.com' },
  },
  full_user_collection: {
    kind: 'NonFungible',
    name: 'FullUserCollection',
    symbol: 'FUC',
    description: 'A collection',
    logoUri: 'https://example.com/logo.png',
    contractUri: 'https://example.com/collection.json',
    updatableMetadata: true,
    pausable: true,
    restrictions: 'blocklist',
    switchablePolicies: true,
  },
  full_ownable_collection: {
    kind: 'NonFungible',
    name: 'FullOwnableCollection',
    symbol: 'FOC',
    updatableMetadata: true,
    pausable: true,
    access: 'ownable',
  },
  full_roles_collection: {
    kind: 'NonFungible',
    name: 'FullRolesCollection',
    symbol: 'FRC',
    burnable: false,
    updatableMetadata: true,
    pausable: true,
    restrictions: 'allowlist',
    switchablePolicies: true,
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

/**
 * Writes a crate depending on the pinned protocol commit, with one module per generated source. Every item of the
 * generated sources is public, so denying warnings turns unused imports into failures.
 */
export async function writeCrate(dir: string, sources: Map<string, string>): Promise<void> {
  const dependency = `{ git = "https://github.com/0xMiden/protocol", rev = "${PROTOCOL_GIT_REV}" }`;
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
      `miden-protocol = ${dependency}`,
      `miden-standards = ${dependency}`,
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
  const modules = [...sources.keys()].sort();
  await writeFile(
    path.join(src, 'lib.rs'),
    ['#![deny(warnings)]', '', ...modules.map(name => `pub mod ${name};`), ''].join('\n'),
  );
  for (const [name, source] of sources) {
    await writeFile(path.join(src, `${name}.rs`), source);
  }
}

/** The covering subset of the option matrix (every `use` item at least once) plus the featured configurations. */
export function sourcesToCompile(): Map<string, string> {
  const sources = new Map<string, string>();
  for (const { contract, source } of generateSources('minimal-cover', true)) {
    sources.set(contract.name.moduleName, source);
  }
  for (const [name, options] of Object.entries(featuredOptions)) {
    sources.set(name, printContract(buildGeneric(options)));
  }
  return sources;
}

export async function cargoCheck(t: ExecutionContext, dir: string): Promise<void> {
  try {
    await asyncExecFile('cargo', ['check', '--quiet'], {
      cwd: dir,
      env: { ...process.env, CARGO_TARGET_DIR: cargoTargetDir() },
      maxBuffer: 64 * 1024 * 1024,
    });
    t.pass();
  } catch (e: unknown) {
    const { stderr } = e as { stderr?: string };
    t.fail(`cargo check failed:\n${stderr ?? String(e)}`);
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
