import { promises as fs } from 'fs';
import os from 'os';
import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';
import path from 'path';
import { promisify } from 'util';
import { exec } from 'child_process';

import { writeGeneratedSources } from './generate/sources';
import type { GenericOptions, KindedOptions } from './build-generic';
import { zipRustProject } from './zip-rust';
import { contractOptionsToContractName } from './zip-shared';
import type { Contract } from './contract';
import { assertLayout, snapshotZipContents, expandPathsFromFilesPaths, extractPackage } from './utils/zip-test';

const asyncExec = promisify(exec);

interface Context {
  generatedSourcesPath: string;
}

const test = _test as TestFn<Context>;

test.serial('fungible result generated', async t => {
  await testGenerate(t, 'Fungible');
});

test.serial('non-fungible result generated', async t => {
  await testGenerate(t, 'NonFungible');
});

async function testGenerate(t: ExecutionContext<Context>, kind: keyof KindedOptions) {
  const generatedSourcesPath = path.join(os.tmpdir(), 'oz-wizard-stellar');
  await fs.rm(generatedSourcesPath, { force: true, recursive: true });
  await writeGeneratedSources(generatedSourcesPath, true, kind);

  t.pass();
}

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
    const temporaryFolder = await fs.mkdtemp(path.join(os.tmpdir(), `compilation-test-${crypto.randomUUID()}`));

    await testFunction(...testFunctionArguments, test, temporaryFolder);

    await fs.rm(temporaryFolder, { recursive: true, force: true });
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
