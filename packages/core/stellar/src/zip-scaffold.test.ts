import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';

import { zipScaffold, contractOptionsToScaffoldContractName } from './zip-scaffold';

import { buildFungible } from './fungible';
import { buildNonFungible } from './non-fungible';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import util from 'util';
import child from 'child_process';
import type { Contract } from './contract';
import { rimraf } from 'rimraf';
import type { JSZipObject } from 'jszip';
import type JSZip from 'jszip';
import type { GenericOptions } from './build-generic';
const asyncExec = util.promisify(child.exec);

interface Context {
  tempFolder: string;
}

const test = _test as TestFn<Context>;

function assertLayout(t: ExecutionContext<Context>, zip: JSZip, opts: GenericOptions) {
  const sorted = Object.values(zip.files)
    .map(f => f.name)
    .sort();

  const scaffoldContractName = contractOptionsToScaffoldContractName(opts?.kind || 'contract');

  t.deepEqual(sorted, [
    'README-WIZARD.md',
    'contracts/',
    `contracts/${scaffoldContractName}/`,
    `contracts/${scaffoldContractName}/Cargo.toml`,
    `contracts/${scaffoldContractName}/src/`,
    `contracts/${scaffoldContractName}/src/contract.rs`,
    `contracts/${scaffoldContractName}/src/lib.rs`,
    `contracts/${scaffoldContractName}/src/test.rs`,
    'setup.sh',
  ]);
}

async function extractPackage(t: ExecutionContext<Context>, zip: JSZip) {
  const tempFolder = t.context.tempFolder;

  const items = Object.values(Object.values(zip.files));

  for (const item of items) {
    if (item.dir) {
      await fs.mkdir(path.join(tempFolder, item.name));
    } else {
      await fs.writeFile(path.join(tempFolder, item.name), await asString(item));
    }
  }
}

async function runProjectSetUp(t: ExecutionContext<Context>) {
  const result = await asyncExec(`cd "${t.context.tempFolder}" && bash setup.sh`);

  t.regex(result.stdout, /Installation complete/);
}

async function runContractTest(t: ExecutionContext<Context>) {
  const result = await asyncExec(`cd "${t.context.tempFolder}" && cargo test`);

  t.regex(result.stdout, /0 failed/);
}

async function assertContents(t: ExecutionContext<Context>, zip: JSZip, opts: GenericOptions) {
  const scaffoldContractName = contractOptionsToScaffoldContractName(opts?.kind || 'contract');

  const contentComparison = [
    await getItemString(zip, `contracts/${scaffoldContractName}/src/contract.rs`),
    await getItemString(zip, `contracts/${scaffoldContractName}/src/test.rs`),
    await getItemString(zip, `contracts/${scaffoldContractName}/src/lib.rs`),
    await getItemString(zip, `contracts/${scaffoldContractName}/Cargo.toml`),
    await getItemString(zip, 'setup.sh'),
    await getItemString(zip, 'README-WIZARD.md'),
  ];

  t.snapshot(contentComparison);
}

async function getItemString({ files }: JSZip, key: string) {
  const obj = files[key];
  if (obj === undefined) throw Error(`Item ${key} not found in zip`);
  return await asString(obj);
}

async function asString(item: JSZipObject) {
  return Buffer.from(await item.async('arraybuffer')).toString();
}

test.beforeEach(async t => {
  t.context.tempFolder = await fs.mkdtemp(path.join(os.tmpdir(), 'openzeppelin-wizard-'));
});

test.afterEach.always(async t => {
  await rimraf(t.context.tempFolder);
});

async function runTest(t: ExecutionContext<Context>, c: Contract, opts: GenericOptions) {
  t.timeout(300_000);

  const zip = await zipScaffold(c, opts);

  assertLayout(t, zip, opts);
  await extractPackage(t, zip);
  await runProjectSetUp(t);
  await runContractTest(t);
  await assertContents(t, zip, opts);
}

test('contractOptionsToScaffoldContractName converts PascalCase to snake_case', t => {
  t.is(contractOptionsToScaffoldContractName('Fungible'), 'fungible');
  t.is(contractOptionsToScaffoldContractName('NonFungible'), 'non_fungible');
  t.is(contractOptionsToScaffoldContractName('Pausable'), 'pausable');
  t.is(contractOptionsToScaffoldContractName('Upgradeable'), 'upgradeable');
  t.is(contractOptionsToScaffoldContractName('MyCustomKind'), 'my_custom_kind');
});

test.serial('fungible simple', async t => {
  const opts: GenericOptions = {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: undefined,
    burnable: false,
    mintable: false,
    pausable: false,
    upgradeable: false,
  };
  const c = buildFungible(opts);
  await runTest(t, c, opts);
});

test.serial('fungible full', async t => {
  const opts: GenericOptions = {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: '2000',
    burnable: true,
    mintable: true,
    pausable: true,
    upgradeable: false,
  };
  const c = buildFungible(opts);
  await runTest(t, c, opts);
});

test.serial('fungible burnable', async t => {
  const opts: GenericOptions = {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: '2000',
    burnable: true,
    mintable: false,
    pausable: false,
    upgradeable: false,
  };
  const c = buildFungible(opts);
  await runTest(t, c, opts);
});

test.serial('fungible mintable', async t => {
  const opts: GenericOptions = {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: '2000',
    burnable: false,
    mintable: true,
    pausable: false,
    upgradeable: false,
  };
  const c = buildFungible(opts);
  await runTest(t, c, opts);
});

test.serial('fungible pausable', async t => {
  const opts: GenericOptions = {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: '2000',
    burnable: false,
    mintable: false,
    pausable: true,
    upgradeable: false,
  };
  const c = buildFungible(opts);
  await runTest(t, c, opts);
});

test.serial('fungible burnable mintable', async t => {
  const opts: GenericOptions = {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: '2000',
    burnable: true,
    mintable: true,
    pausable: false,
    upgradeable: false,
  };
  const c = buildFungible(opts);
  await runTest(t, c, opts);
});

test.serial('fungible burnable pausable', async t => {
  const opts: GenericOptions = {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: '2000',
    burnable: true,
    mintable: false,
    pausable: true,
    upgradeable: false,
  };
  const c = buildFungible(opts);
  await runTest(t, c, opts);
});

test.serial('fungible mintable pausable', async t => {
  const opts: GenericOptions = {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: '2000',
    burnable: false,
    mintable: true,
    pausable: true,
    upgradeable: false,
  };
  const c = buildFungible(opts);
  await runTest(t, c, opts);
});

test.serial('fungible upgradable simple', async t => {
  const opts: GenericOptions = {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: undefined,
    burnable: false,
    mintable: false,
    pausable: false,
    upgradeable: true,
  };
  const c = buildFungible(opts);
  await runTest(t, c, opts);
});

test.serial('fungible upgradable full', async t => {
  const opts: GenericOptions = {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: '2000',
    burnable: true,
    mintable: true,
    pausable: true,
    upgradeable: true,
  };
  const c = buildFungible(opts);
  await runTest(t, c, opts);
});

test.serial('fungible upgradable burnable', async t => {
  const opts: GenericOptions = {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: '2000',
    burnable: true,
    mintable: false,
    pausable: false,
    upgradeable: true,
  };
  const c = buildFungible(opts);
  await runTest(t, c, opts);
});

test.serial('fungible upgradable mintable', async t => {
  const opts: GenericOptions = {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: '2000',
    burnable: false,
    mintable: true,
    pausable: false,
    upgradeable: true,
  };
  const c = buildFungible(opts);
  await runTest(t, c, opts);
});

test.serial('fungible upgradable pausable', async t => {
  const opts: GenericOptions = {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: '2000',
    burnable: false,
    mintable: false,
    pausable: true,
    upgradeable: true,
  };
  const c = buildFungible(opts);
  await runTest(t, c, opts);
});

test.serial('fungible upgradable burnable mintable', async t => {
  const opts: GenericOptions = {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: '2000',
    burnable: true,
    mintable: true,
    pausable: false,
    upgradeable: true,
  };
  const c = buildFungible(opts);
  await runTest(t, c, opts);
});

test.serial('fungible upgradable burnable pausable', async t => {
  const opts: GenericOptions = {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: '2000',
    burnable: true,
    mintable: false,
    pausable: true,
    upgradeable: true,
  };
  const c = buildFungible(opts);
  await runTest(t, c, opts);
});

test.serial('fungible upgradable mintable pausable', async t => {
  const opts: GenericOptions = {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: '2000',
    burnable: false,
    mintable: true,
    pausable: true,
    upgradeable: true,
  };
  const c = buildFungible(opts);
  await runTest(t, c, opts);
});

test.serial('nonfungible simple', async t => {
  const opts: GenericOptions = {
    kind: 'NonFungible',
    name: 'MyNFT',
    symbol: 'MNFT',
    burnable: false,
    enumerable: false,
    consecutive: false,
    pausable: false,
    upgradeable: false,
    mintable: false,
    sequential: false,
  };
  const c = buildNonFungible(opts);
  await runTest(t, c, opts);
});

test.serial('nonfungible full', async t => {
  const opts: GenericOptions = {
    kind: 'NonFungible',
    name: 'MyNFT',
    symbol: 'MNFT',
    burnable: true,
    enumerable: true,
    consecutive: true,
    pausable: true,
    upgradeable: true,
    mintable: true,
    sequential: true,
  };
  const c = buildNonFungible(opts);
  await runTest(t, c, opts);
});

test.serial('nonfungible burnable', async t => {
  const opts: GenericOptions = {
    kind: 'NonFungible',
    name: 'MyNFT',
    symbol: 'MNFT',
    burnable: true,
    enumerable: false,
    consecutive: false,
    pausable: false,
    upgradeable: false,
    mintable: false,
    sequential: false,
  };
  const c = buildNonFungible(opts);
  await runTest(t, c, opts);
});

test.serial('nonfungible enumerable', async t => {
  const opts: GenericOptions = {
    kind: 'NonFungible',
    name: 'MyNFT',
    symbol: 'MNFT',
    burnable: false,
    enumerable: true,
    consecutive: false,
    pausable: false,
    upgradeable: false,
    mintable: false,
    sequential: false,
  };
  const c = buildNonFungible(opts);
  await runTest(t, c, opts);
});

test.serial('nonfungible consecutive', async t => {
  const opts: GenericOptions = {
    kind: 'NonFungible',
    name: 'MyNFT',
    symbol: 'MNFT',
    burnable: false,
    enumerable: false,
    consecutive: true,
    pausable: false,
    upgradeable: false,
    mintable: false,
    sequential: false,
  };
  const c = buildNonFungible(opts);
  await runTest(t, c, opts);
});

test.serial('nonfungible pausable', async t => {
  const opts: GenericOptions = {
    kind: 'NonFungible',
    name: 'MyNFT',
    symbol: 'MNFT',
    burnable: false,
    enumerable: false,
    consecutive: false,
    pausable: true,
    upgradeable: false,
    mintable: false,
    sequential: false,
  };
  const c = buildNonFungible(opts);
  await runTest(t, c, opts);
});

test.serial('nonfungible upgradeable', async t => {
  const opts: GenericOptions = {
    kind: 'NonFungible',
    name: 'MyNFT',
    symbol: 'MNFT',
    burnable: false,
    enumerable: false,
    consecutive: false,
    pausable: false,
    upgradeable: true,
    mintable: false,
    sequential: false,
  };
  const c = buildNonFungible(opts);
  await runTest(t, c, opts);
});

test.serial('nonfungible mintable', async t => {
  const opts: GenericOptions = {
    kind: 'NonFungible',
    name: 'MyNFT',
    symbol: 'MNFT',
    burnable: false,
    enumerable: false,
    consecutive: false,
    pausable: false,
    upgradeable: false,
    mintable: true,
    sequential: false,
  };
  const c = buildNonFungible(opts);
  await runTest(t, c, opts);
});

test.serial('nonfungible sequential', async t => {
  const opts: GenericOptions = {
    kind: 'NonFungible',
    name: 'MyNFT',
    symbol: 'MNFT',
    burnable: false,
    enumerable: false,
    consecutive: false,
    pausable: false,
    upgradeable: false,
    mintable: false,
    sequential: true,
  };
  const c = buildNonFungible(opts);
  await runTest(t, c, opts);
});

// Some combinations
test.serial('nonfungible burnable enumerable', async t => {
  const opts: GenericOptions = {
    kind: 'NonFungible',
    name: 'MyNFT',
    symbol: 'MNFT',
    burnable: true,
    enumerable: true,
    consecutive: false,
    pausable: false,
    upgradeable: false,
    mintable: false,
    sequential: false,
  };
  const c = buildNonFungible(opts);
  await runTest(t, c, opts);
});

test.serial('nonfungible burnable pausable', async t => {
  const opts: GenericOptions = {
    kind: 'NonFungible',
    name: 'MyNFT',
    symbol: 'MNFT',
    burnable: true,
    enumerable: false,
    consecutive: false,
    pausable: true,
    upgradeable: false,
    mintable: false,
    sequential: false,
  };
  const c = buildNonFungible(opts);
  await runTest(t, c, opts);
});

test.serial('nonfungible mintable upgradeable', async t => {
  const opts: GenericOptions = {
    kind: 'NonFungible',
    name: 'MyNFT',
    symbol: 'MNFT',
    burnable: false,
    enumerable: false,
    consecutive: false,
    pausable: false,
    upgradeable: true,
    mintable: true,
    sequential: false,
  };
  const c = buildNonFungible(opts);
  await runTest(t, c, opts);
});

test.serial('nonfungible full except sequential', async t => {
  const opts: GenericOptions = {
    kind: 'NonFungible',
    name: 'MyNFT',
    symbol: 'MNFT',
    burnable: true,
    enumerable: true,
    consecutive: true,
    pausable: true,
    upgradeable: true,
    mintable: true,
    sequential: false,
  };
  const c = buildNonFungible(opts);
  await runTest(t, c, opts);
});
