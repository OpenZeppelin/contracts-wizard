import test, { ExecutionContext } from 'ava';

import { zipHardhat } from './zip-hardhat';

import { buildERC20 } from './erc20';
import { buildERC721 } from './erc721';
import { buildERC1155 } from './erc1155';
import { buildCustom } from './custom';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import util, { promisify } from 'util';
import child from "child_process";
import type { Contract } from './contract';
import _rimraf from 'rimraf';
import type { JSZipObject } from 'jszip';
import type JSZip from 'jszip';
import type { GenericOptions } from './build-generic';

const rimraf = promisify(_rimraf);

test.serial('erc20 basic', async t => {
  const opts: GenericOptions = { kind: 'ERC20', name: 'My Token', symbol: 'MTK' };
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

async function runTest(c: Contract, t: ExecutionContext<unknown>, opts: GenericOptions) {
  const zip = await zipHardhat(c, opts);

  assertLayout(zip, t, c);
  await extractAndRunPackage(zip, t);
  await assertContents(zip, c, t);
}

function assertLayout(zip: JSZip, t: ExecutionContext<unknown>, c: Contract) {
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

async function extractAndRunPackage(zip: JSZip, t: ExecutionContext<unknown>) {
  const files = Object.values(zip.files);

  const tempFolder = await fs.mkdtemp(path.join(os.tmpdir(), 'openzeppelin-wizard-'));
  try {
    const items = Object.values(files);
    for (const item of items) {
      if (item.dir) {
        await fs.mkdir(path.join(tempFolder, item.name));
      } else {
        await fs.writeFile(path.join(tempFolder, item.name), await asString(item));
      }
    }

    const exec = util.promisify(child.exec);
    const result = await exec(`cd "${tempFolder}" && npm config set scripts-prepend-node-path auto && npm install && npm test && npx hardhat run scripts/deploy.ts`);
    t.regex(result.stdout, /1 passing/);
    t.regex(result.stdout, /deployed to/);
  } finally {
    await rimraf(tempFolder);
  }
}

async function assertContents(zip: JSZip, c: Contract, t: ExecutionContext<unknown>) {
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
  if (obj !== undefined) {
    return await asString(obj);
  } else {
    return '';
  }
}

async function asString(item: JSZipObject) {
  return Buffer.from(await item.async('arraybuffer')).toString();
}
