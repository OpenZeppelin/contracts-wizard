import type { ExecutionContext } from 'ava';
import { exec } from 'child_process';
import { copyFile, mkdir, mkdtemp, readFile, rm, writeFile } from 'fs/promises';
import { homedir, tmpdir } from 'os';
import path from 'path';
import { promisify } from 'util';
import type { GenericOptions } from '../build-generic';
import type { Contract } from '../contract';
import { zipRustProject } from '../zip-rust';
import { contractOptionsToContractName } from '../zip-shared';
import { assertLayout, expandPathsFromFilesPaths, extractPackage, snapshotZipContents } from './zip-test';

const asyncExec = promisify(exec);

export const runCargoTest = async (t: ExecutionContext, temporaryFolder: string) => {
  const result = await asyncExec(`cd "${temporaryFolder}" && cargo test`);

  t.regex(result.stdout, /0 failed/);
};

const resolvePath = (inputPath: string) =>
  inputPath.startsWith('~/') ? path.join(homedir(), inputPath.slice(2)) : path.resolve(inputPath);
const toCargoPath = (inputPath: string) => inputPath.replace(/\\/g, '/');

const localDependencies = [
  ['stellar-tokens', 'packages/tokens'],
  ['stellar-access', 'packages/access'],
  ['stellar-contract-utils', 'packages/contract-utils'],
  ['stellar-governance', 'packages/governance'],
  ['stellar-macros', 'packages/macros'],
] as const;

const workspaceDependenciesPattern = /\[workspace\.dependencies\][\s\S]*?(?=\n\[profile\.release\])/;

async function rewriteWorkspaceCargoForLocalContracts(workspaceCargoPath: string, stellarContractsPath: string) {
  const absoluteContractsPath = resolvePath(stellarContractsPath);
  const upstreamCargoPath = path.join(absoluteContractsPath, 'Cargo.toml');
  const upstreamLockPath = path.join(absoluteContractsPath, 'Cargo.lock');
  const workspaceDir = path.dirname(workspaceCargoPath);

  const [workspaceCargo, upstreamCargo] = await Promise.all([
    readFile(workspaceCargoPath, 'utf8'),
    readFile(upstreamCargoPath, 'utf8'),
  ]);

  const sorobanMatch = upstreamCargo.match(/^\s*soroban-sdk\s*=\s*"([^"]+)"/m);
  if (sorobanMatch === null || sorobanMatch[1] === undefined) {
    throw new Error(`Unable to find soroban-sdk version in ${upstreamCargoPath}`);
  }

  const dependencyLines = [
    `soroban-sdk = "${sorobanMatch[1]}"`,
    ...localDependencies.map(
      ([crate, relativePath]) =>
        `${crate} = { path = "${toCargoPath(path.join(absoluteContractsPath, relativePath))}" }`,
    ),
  ];

  if (!workspaceDependenciesPattern.test(workspaceCargo)) {
    throw new Error(`Unable to locate [workspace.dependencies] section in ${workspaceCargoPath}`);
  }

  const nextCargo = workspaceCargo.replace(
    workspaceDependenciesPattern,
    `[workspace.dependencies]\n${dependencyLines.join('\n')}\n`,
  );

  await writeFile(workspaceCargoPath, nextCargo);

  // Reuse upstream lockfile when available to minimize resolver drift/offline cache misses.
  try {
    await copyFile(upstreamLockPath, path.join(workspaceDir, 'Cargo.lock'));
  } catch {
    // Ignore if lockfile is unavailable.
  }
}

type WithTemporaryFolderTestFunction<Args extends unknown[]> = (
  ...args: [...Args, ExecutionContext, string]
) => Promise<void> | void;

export type MakeContract = (opt: any) => Contract;

export const withTemporaryFolderDo =
  <Args extends unknown[]>(testFunction: WithTemporaryFolderTestFunction<Args>) =>
  (...testFunctionArguments: Args) =>
  async (test: ExecutionContext) => {
    const temporaryFolder = await mkdtemp(path.join(tmpdir(), `compilation-test-${crypto.randomUUID()}`));
    try {
      await testFunction(...testFunctionArguments, test, temporaryFolder);
    } finally {
      await rm(temporaryFolder, { recursive: true, force: true });
    }
  };

const doRunRustCompilationTest = async (
  makeContract: MakeContract,
  opts: GenericOptions,
  testOptions: { snapshotResult: boolean },
  test: ExecutionContext,
  folderPath: string,
) => {
  test.timeout(3_000_000);

  await mkdir(folderPath, { recursive: true });

  const scaffoldContractName = contractOptionsToContractName(opts?.kind || 'contract');

  const expectedZipFiles = [
    `contracts/${scaffoldContractName}/src/contract.rs`,
    `contracts/${scaffoldContractName}/src/test.rs`,
    `contracts/${scaffoldContractName}/src/lib.rs`,
    `contracts/${scaffoldContractName}/Cargo.toml`,
    'Cargo.toml',
    '.gitignore',
    'README.md',
  ];

  const zip = await zipRustProject(makeContract(opts), opts);

  assertLayout(test, zip, expandPathsFromFilesPaths(expectedZipFiles));
  await extractPackage(zip, folderPath);

  if (process.env.STELLAR_CONTRACTS_PATH !== undefined) {
    // Useful for release-candidate validation before crates.io publication.
    await rewriteWorkspaceCargoForLocalContracts(
      path.join(folderPath, 'Cargo.toml'),
      process.env.STELLAR_CONTRACTS_PATH,
    );
  }

  await runCargoTest(test, folderPath);

  if (testOptions.snapshotResult) await snapshotZipContents(test, zip, expectedZipFiles);
};

export const runRustCompilationTest = withTemporaryFolderDo(
  async (
    makeContract: MakeContract,
    opts: GenericOptions,
    testOptions: { snapshotResult: boolean; excludeExplicitTraitTest?: boolean },
    test: ExecutionContext,
    folderPath: string,
  ) => {
    await doRunRustCompilationTest(makeContract, opts, testOptions, test, `${folderPath}/default`);

    const optsWithExplicit = opts as GenericOptions & { explicitImplementations?: boolean };
    const supportsExplicitImplementations = 'explicitImplementations' in optsWithExplicit;
    const shouldBeExcludedOrHasAlreadyRun =
      testOptions.excludeExplicitTraitTest ||
      !supportsExplicitImplementations ||
      optsWithExplicit.explicitImplementations;
    if (shouldBeExcludedOrHasAlreadyRun) return;

    try {
      await doRunRustCompilationTest(
        makeContract,
        { ...optsWithExplicit, explicitImplementations: true } as GenericOptions,
        testOptions,
        test,
        `${folderPath}/explicit`,
      );
    } catch (error) {
      throw new Error(`EXPLICIT IMPLEMENTATION ERROR: ${error}`);
    }
  },
);
