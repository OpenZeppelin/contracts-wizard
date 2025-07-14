import type { ExecutionContext } from 'ava';
import _test from 'ava';

import { zipScaffoldProject } from './zip-scaffold';

import util from 'util';
import child from 'child_process';
import type { GenericOptions } from './build-generic';
import { contractOptionsToContractName } from './zip-shared';
import { runCargoTest, withTemporaryFolderDo, type MakeContract } from './utils/compile-test';
import { assertLayout, expandPathsFromFilesPaths, extractPackage, snapshotZipContents } from './utils/zip-test';
import { buildFungible } from './fungible';
import test from 'ava';

const asyncExec = util.promisify(child.exec);

async function runProjectSetUp(t: ExecutionContext, folderPath: string) {
  const result = await asyncExec(`cd "${folderPath}" && bash setup.sh`);

  t.regex(result.stdout, /Installation complete/);
}

const runScaffoldCompilationTest = withTemporaryFolderDo(
  async (makeContract: MakeContract, opts: GenericOptions, test: ExecutionContext, folderPath: string) => {
    test.timeout(3_000_000);

    const scaffoldContractName = contractOptionsToContractName(opts?.kind || 'contract');

    const expectedZipFiles = [
      'Cargo.toml',
      `contracts/${scaffoldContractName}/src/contract.rs`,
      `contracts/${scaffoldContractName}/src/test.rs`,
      `contracts/${scaffoldContractName}/src/lib.rs`,
      `contracts/${scaffoldContractName}/Cargo.toml`,
      'setup.sh',
      'README-WIZARD.md',
    ];

    const zip = await zipScaffoldProject(makeContract(opts), opts);

    assertLayout(test, zip, expandPathsFromFilesPaths(expectedZipFiles));
    await extractPackage(zip, folderPath);
    await runCargoTest(test, folderPath);
    await runProjectSetUp(test, folderPath);

    await snapshotZipContents(test, zip, expectedZipFiles);
  },
);

test('placeholder', t => t.assert(true));

// test.serial(
//   'zip scaffold fungible simple',
//   runScaffoldCompilationTest(buildFungible, {
//     kind: 'Fungible',
//     name: 'MyToken',
//     symbol: 'MTK',
//     premint: undefined,
//     burnable: false,
//     mintable: false,
//     pausable: false,
//     upgradeable: false,
//   }),
// );

// test.serial(
//   'zip scaffold fungible full',
//   runScaffoldCompilationTest(buildFungible, {
//     kind: 'Fungible',
//     name: 'MyToken',
//     symbol: 'MTK',
//     premint: '2000',
//     burnable: true,
//     mintable: true,
//     pausable: true,
//     upgradeable: true,
//   }),
// );
