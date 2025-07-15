import { tmpdir } from 'os';
import type { ExecutionContext } from 'ava';
import _test from 'ava';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';
import type { GenericOptions } from '../build-generic';
import type { Contract } from '../contract';
import { assertLayout, snapshotZipContents, expandPathsFromFilesPaths, extractPackage } from './zip-test';
import { mkdtemp, rm } from 'fs/promises';
import { contractOptionsToContractName } from '../zip-shared';
import { zipRustProject } from '../zip-rust';

const asyncExec = promisify(exec);

export const runCargoTest = async (t: ExecutionContext, temporaryFolder: string) => {
  const result = await asyncExec(`cd "${temporaryFolder}" && RUSTFLAGS="-D warnings" cargo test`);

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

export const runRustCompilationTest = withTemporaryFolderDo(
  async (makeContract: MakeContract, opts: GenericOptions, test: ExecutionContext, folderPath: string) => {
    test.timeout(3_000_000);

    const scaffoldContractName = contractOptionsToContractName(opts?.kind || 'contract');

    const expectedZipFiles = [
      `contracts/${scaffoldContractName}/src/contract.rs`,
      `contracts/${scaffoldContractName}/src/test.rs`,
      `contracts/${scaffoldContractName}/src/lib.rs`,
      `contracts/${scaffoldContractName}/Cargo.toml`,
      'Cargo.toml',
      'README.md',
    ];

    const zip = await zipRustProject(makeContract(opts), opts);

    assertLayout(test, zip, expandPathsFromFilesPaths(expectedZipFiles));
    await extractPackage(zip, folderPath);
    await runCargoTest(test, folderPath);

    await snapshotZipContents(test, zip, expectedZipFiles);
  },
);
