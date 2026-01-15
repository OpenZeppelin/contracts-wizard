import type { ExecutionContext } from 'ava';
import { exec } from 'child_process';
import { mkdir, mkdtemp, rm } from 'fs/promises';
import { tmpdir } from 'os';
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

type WithTemporaryFolderTestFunction<Args extends unknown[]> = (
  ...args: [...Args, ExecutionContext, string]
) => Promise<void> | void;

export type MakeContract = (opt: GenericOptions) => Contract;

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

    const shouldBeExcludedOrHasAlreadyRun = testOptions.excludeExplicitTraitTest || opts.explicitImplementations;
    if (shouldBeExcludedOrHasAlreadyRun) return;

    try {
      await doRunRustCompilationTest(
        makeContract,
        { ...opts, explicitImplementations: true },
        testOptions,
        test,
        `${folderPath}/explicit`,
      );
    } catch (error) {
      throw new Error(`EXPLICIT IMPLEMENTATION ERROR: ${error}`);
    }
  },
);
