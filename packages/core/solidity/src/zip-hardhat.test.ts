import _test, { TestFn, ExecutionContext } from 'ava';

import { zipHardhat } from './zip-hardhat';

import { buildERC20 } from './erc20';
import { buildERC721 } from './erc721';
import { buildERC1155 } from './erc1155';
import { buildCustom } from './custom';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import util from 'util';
import child from "child_process";
import type { Contract } from './contract';
import { rimraf } from 'rimraf';
import type { JSZipObject } from 'jszip';
import type JSZip from 'jszip';
import type { GenericOptions } from './build-generic';

interface Context {
  tempFolder: string;
}

const test = _test as TestFn<Context>;

test.beforeEach(async t => {
  t.context.tempFolder = await fs.mkdtemp(path.join(os.tmpdir(), 'openzeppelin-wizard-'));
});

test.afterEach.always(async t => {
  await rimraf(t.context.tempFolder);
});

test.serial('erc20 full', async t => {
  const opts: GenericOptions = {
    kind: 'ERC20',
    name: 'My Token',
    symbol: 'MTK',
    premint: '2000',
    access: 'roles',
    burnable: true,
    mintable: true,
    pausable: true,
    permit: true,
    votes: true,
    flashmint: true,
  };
  const c = buildERC20(opts);
  await runTest(c, t, opts);
});

test.serial('erc721 upgradeable', async t => {
  const opts: GenericOptions = { kind: 'ERC721', name: 'My Token', symbol: 'MTK', upgradeable: 'uups' };
  const c = buildERC721(opts);
  await runTest(c, t, opts);
});

test.serial('erc1155 basic', async t => {
  const opts: GenericOptions = { kind: 'ERC1155', name: 'My Token', uri: 'https://myuri/{id}' };
  const c = buildERC1155(opts);
  await runTest(c, t, opts);
});

test.serial('custom basic', async t => {
  const opts: GenericOptions = { kind: 'Custom', name: 'My Contract' };
  const c = buildCustom(opts);
  await runTest(c, t, opts);
});

test.serial('custom upgradeable', async t => {
  const opts: GenericOptions = { kind: 'Custom',  name: 'My Contract', upgradeable: 'transparent' };
  const c = buildCustom(opts);
  await runTest(c, t, opts);
});

async function runTest(c: Contract, t: ExecutionContext<Context>, opts: GenericOptions) {
  const zip = await zipHardhat(c, opts);

  assertLayout(zip, c, t);
  await extractAndRunPackage(zip, c, t);
  await assertContents(zip, c, t);
}

function assertLayout(zip: JSZip, c: Contract, t: ExecutionContext<Context>) {
  const sorted = Object.values(zip.files).map(f => f.name).sort();
  t.deepEqual(sorted, [
    '.gitignore',
    'README.md',
    'contracts/',
    `contracts/${c.name}.sol`,
    'hardhat.config.ts',
    'package-lock.json',
    'package.json',
    'scripts/',
    'scripts/deploy.ts',
    'test/',
    'test/test.ts',
    'tsconfig.json',
  ]);
}

async function extractAndRunPackage(zip: JSZip, c: Contract, t: ExecutionContext<Context>) {
  const files = Object.values(zip.files);

  const tempFolder = t.context.tempFolder;

  const items = Object.values(files);
  for (const item of items) {
    if (item.dir) {
      await fs.mkdir(path.join(tempFolder, item.name));
    } else {
      await fs.writeFile(path.join(tempFolder, item.name), await asString(item));
    }
  }

  let command = `cd "${tempFolder}" && npm install && npm test`;
  if (c.constructorArgs === undefined) {
    // only test deploying the contract if there are no constructor args needed
    command += ' && npx hardhat run scripts/deploy.ts';
  }

  const exec = util.promisify(child.exec);
  const result = await exec(command);

  t.regex(result.stdout, /1 passing/);
  if (c.constructorArgs === undefined) {
    t.regex(result.stdout, /deployed to/);
  }
}

async function assertContents(zip: JSZip, c: Contract, t: ExecutionContext<Context>) {
  const contentComparison = [
    await getItemString(zip, `contracts/${c.name}.sol`),
    await getItemString(zip, 'hardhat.config.ts'),
    await getItemString(zip, 'package.json'),
    await getItemString(zip, 'scripts/deploy.ts'),
    await getItemString(zip, 'test/test.ts'),
  ];

  t.snapshot(contentComparison);
}

async function getItemString(zip: JSZip, key: string) {
  const obj = zip.files[key];
  if (obj === undefined) {
    throw Error(`Item ${key} not found in zip`);
  }
  return await asString(obj);
}

async function asString(item: JSZipObject) {
  return Buffer.from(await item.async('arraybuffer')).toString();
}
