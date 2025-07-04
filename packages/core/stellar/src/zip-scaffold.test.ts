import type { ExecutionContext } from 'ava';
import _test from 'ava';

import { zipScaffoldProject } from './zip-scaffold';

import util from 'util';
import child from 'child_process';
import type { GenericOptions } from './build-generic';
import { contractOptionsToContractName } from './zip-shared';
import type { MakeContract } from './test';
import { runCargoTest, withTemporaryFolderDo } from './test';
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

test(
  'zip scaffold fungible simple',
  runScaffoldCompilationTest(buildFungible, {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: undefined,
    burnable: false,
    mintable: false,
    pausable: false,
    upgradeable: false,
  }),
);

test(
  'zip scaffold fungible upgradable full',
  runScaffoldCompilationTest(buildFungible, {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: '2000',
    burnable: true,
    mintable: true,
    pausable: true,
    upgradeable: true,
  }),
);

// test('fungible burnable', async t => {
//   const opts: GenericOptions = {
//     kind: 'Fungible',
//     name: 'MyToken',
//     symbol: 'MTK',
//     premint: '2000',
//     burnable: true,
//     mintable: false,
//     pausable: false,
//     upgradeable: false,
//   };
//   const c = buildFungible(opts);
//   await runTest(t, c, opts);
// });

// test('fungible mintable', async t => {
//   const opts: GenericOptions = {
//     kind: 'Fungible',
//     name: 'MyToken',
//     symbol: 'MTK',
//     premint: '2000',
//     burnable: false,
//     mintable: true,
//     pausable: false,
//     upgradeable: false,
//   };
//   const c = buildFungible(opts);
//   await runTest(t, c, opts);
// });

// test('fungible pausable', async t => {
//   const opts: GenericOptions = {
//     kind: 'Fungible',
//     name: 'MyToken',
//     symbol: 'MTK',
//     premint: '2000',
//     burnable: false,
//     mintable: false,
//     pausable: true,
//     upgradeable: false,
//   };
//   const c = buildFungible(opts);
//   await runTest(t, c, opts);
// });

// test('fungible burnable mintable', async t => {
//   const opts: GenericOptions = {
//     kind: 'Fungible',
//     name: 'MyToken',
//     symbol: 'MTK',
//     premint: '2000',
//     burnable: true,
//     mintable: true,
//     pausable: false,
//     upgradeable: false,
//   };
//   const c = buildFungible(opts);
//   await runTest(t, c, opts);
// });

// test('fungible burnable pausable', async t => {
//   const opts: GenericOptions = {
//     kind: 'Fungible',
//     name: 'MyToken',
//     symbol: 'MTK',
//     premint: '2000',
//     burnable: true,
//     mintable: false,
//     pausable: true,
//     upgradeable: false,
//   };
//   const c = buildFungible(opts);
//   await runTest(t, c, opts);
// });

// test('fungible mintable pausable', async t => {
//   const opts: GenericOptions = {
//     kind: 'Fungible',
//     name: 'MyToken',
//     symbol: 'MTK',
//     premint: '2000',
//     burnable: false,
//     mintable: true,
//     pausable: true,
//     upgradeable: false,
//   };
//   const c = buildFungible(opts);
//   await runTest(t, c, opts);
// });

// test('fungible upgradable simple', async t => {
//   const opts: GenericOptions = {
//     kind: 'Fungible',
//     name: 'MyToken',
//     symbol: 'MTK',
//     premint: undefined,
//     burnable: false,
//     mintable: false,
//     pausable: false,
//     upgradeable: true,
//   };
//   const c = buildFungible(opts);
//   await runTest(t, c, opts);
// });

// test('fungible upgradable full', async t => {
//   const opts: GenericOptions = {
//     kind: 'Fungible',
//     name: 'MyToken',
//     symbol: 'MTK',
//     premint: '2000',
//     burnable: true,
//     mintable: true,
//     pausable: true,
//     upgradeable: true,
//   };
//   const c = buildFungible(opts);
//   await runTest(t, c, opts);
// });

// test('fungible upgradable burnable', async t => {
//   const opts: GenericOptions = {
//     kind: 'Fungible',
//     name: 'MyToken',
//     symbol: 'MTK',
//     premint: '2000',
//     burnable: true,
//     mintable: false,
//     pausable: false,
//     upgradeable: true,
//   };
//   const c = buildFungible(opts);
//   await runTest(t, c, opts);
// });

// test('fungible upgradable mintable', async t => {
//   const opts: GenericOptions = {
//     kind: 'Fungible',
//     name: 'MyToken',
//     symbol: 'MTK',
//     premint: '2000',
//     burnable: false,
//     mintable: true,
//     pausable: false,
//     upgradeable: true,
//   };
//   const c = buildFungible(opts);
//   await runTest(t, c, opts);
// });

// test('fungible upgradable pausable', async t => {
//   const opts: GenericOptions = {
//     kind: 'Fungible',
//     name: 'MyToken',
//     symbol: 'MTK',
//     premint: '2000',
//     burnable: false,
//     mintable: false,
//     pausable: true,
//     upgradeable: true,
//   };
//   const c = buildFungible(opts);
//   await runTest(t, c, opts);
// });

// test('fungible upgradable burnable mintable', async t => {
//   const opts: GenericOptions = {
//     kind: 'Fungible',
//     name: 'MyToken',
//     symbol: 'MTK',
//     premint: '2000',
//     burnable: true,
//     mintable: true,
//     pausable: false,
//     upgradeable: true,
//   };
//   const c = buildFungible(opts);
//   await runTest(t, c, opts);
// });

// test('fungible upgradable burnable pausable', async t => {
//   const opts: GenericOptions = {
//     kind: 'Fungible',
//     name: 'MyToken',
//     symbol: 'MTK',
//     premint: '2000',
//     burnable: true,
//     mintable: false,
//     pausable: true,
//     upgradeable: true,
//   };
//   const c = buildFungible(opts);
//   await runTest(t, c, opts);
// });

// test('fungible upgradable mintable pausable', async t => {
//   const opts: GenericOptions = {
//     kind: 'Fungible',
//     name: 'MyToken',
//     symbol: 'MTK',
//     premint: '2000',
//     burnable: false,
//     mintable: true,
//     pausable: true,
//     upgradeable: true,
//   };
//   const c = buildFungible(opts);
//   await runTest(t, c, opts);
// });

// test('nonfungible simple', async t => {
//   const opts: GenericOptions = {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: false,
//     enumerable: false,
//     consecutive: false,
//     pausable: false,
//     upgradeable: false,
//     mintable: false,
//     sequential: false,
//   };
//   const c = buildNonFungible(opts);
//   await runTest(t, c, opts);
// });

// test('nonfungible full except sequential mintable enumerable', async t => {
//   const opts: GenericOptions = {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: true,
//     enumerable: false,
//     consecutive: true,
//     pausable: true,
//     upgradeable: true,
//     mintable: false,
//     sequential: false,
//   };
//   const c = buildNonFungible(opts);
//   await runTest(t, c, opts);
// });

// test('nonfungible burnable', async t => {
//   const opts: GenericOptions = {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: true,
//     enumerable: false,
//     consecutive: false,
//     pausable: false,
//     upgradeable: false,
//     mintable: false,
//     sequential: false,
//   };
//   const c = buildNonFungible(opts);
//   await runTest(t, c, opts);
// });

// test('nonfungible consecutive', async t => {
//   const opts: GenericOptions = {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: false,
//     enumerable: false,
//     consecutive: true,
//     pausable: false,
//     upgradeable: false,
//     mintable: false,
//     sequential: false,
//   };
//   const c = buildNonFungible(opts);
//   await runTest(t, c, opts);
// });

// test('nonfungible pausable', async t => {
//   const opts: GenericOptions = {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: false,
//     enumerable: false,
//     consecutive: false,
//     pausable: true,
//     upgradeable: false,
//     mintable: false,
//     sequential: false,
//   };
//   const c = buildNonFungible(opts);
//   await runTest(t, c, opts);
// });

// test('nonfungible upgradeable', async t => {
//   const opts: GenericOptions = {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: false,
//     enumerable: false,
//     consecutive: false,
//     pausable: false,
//     upgradeable: true,
//     mintable: false,
//     sequential: false,
//   };
//   const c = buildNonFungible(opts);
//   await runTest(t, c, opts);
// });

// test('nonfungible sequential', async t => {
//   const opts: GenericOptions = {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: false,
//     enumerable: false,
//     consecutive: false,
//     pausable: false,
//     upgradeable: false,
//     mintable: false,
//     sequential: true,
//   };
//   const c = buildNonFungible(opts);
//   await runTest(t, c, opts);
// });

// test('nonfungible burnable pausable', async t => {
//   const opts: GenericOptions = {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: true,
//     enumerable: false,
//     consecutive: false,
//     pausable: true,
//     upgradeable: false,
//     mintable: false,
//     sequential: false,
//   };
//   const c = buildNonFungible(opts);
//   await runTest(t, c, opts);
// });

// test('nonfungible enumerable', async t => {
//   const opts: GenericOptions = {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: false,
//     enumerable: true,
//     consecutive: false,
//     pausable: false,
//     upgradeable: false,
//     mintable: false,
//     sequential: false,
//   };
//   const c = buildNonFungible(opts);
//   await runTest(t, c, opts);
// });

// test('nonfungible burnable enumerable', async t => {
//   const opts: GenericOptions = {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: true,
//     enumerable: true,
//     consecutive: false,
//     pausable: false,
//     upgradeable: false,
//     mintable: false,
//     sequential: false,
//   };
//   const c = buildNonFungible(opts);
//   await runTest(t, c, opts);
// });

// test('nonfungible full except consecutive', async t => {
//   const opts: GenericOptions = {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: true,
//     enumerable: true,
//     consecutive: false,
//     pausable: true,
//     upgradeable: true,
//     mintable: true,
//     sequential: true,
//   };
//   const c = buildNonFungible(opts);
//   await runTest(t, c, opts);
// });

// -- TODO fix build --

// test('nonfungible mintable', async t => {
//   const opts: GenericOptions = {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: false,
//     enumerable: false,
//     consecutive: false,
//     pausable: false,
//     upgradeable: false,
//     mintable: true,
//     sequential: false,
//   };
//   const c = buildNonFungible(opts);
//   await runTest(t, c, opts);
// });

// test('nonfungible mintable upgradeable', async t => {
//   const opts: GenericOptions = {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: false,
//     enumerable: false,
//     consecutive: false,
//     pausable: false,
//     upgradeable: true,
//     mintable: true,
//     sequential: false,
//   };
//   const c = buildNonFungible(opts);
//   await runTest(t, c, opts);
// });

//--
