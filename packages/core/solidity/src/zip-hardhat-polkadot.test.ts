import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';

import { zipHardhatPolkadot } from './zip-hardhat-polkadot';

import { buildERC20 } from './erc20';
import { buildERC721 } from './erc721';
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
  await runIgnitionTest(c, t, opts);
});

test.serial('erc721 basic', async t => {
  const opts: GenericOptions = {
    kind: 'ERC721',
    name: 'My Token',
    symbol: 'MTK',
  };
  const c = buildERC721(opts);
  await runIgnitionTest(c, t, opts);
});

async function runIgnitionTest(c: Contract, t: ExecutionContext<Context>, opts: GenericOptions) {
  const zip = await zipHardhatPolkadot(c, opts);

  assertIgnitionLayout(zip, c, t);
  await extractAndRun(zip, c, t);
  await assertIgnitionContents(zip, c, t);
}

function assertIgnitionLayout(zip: JSZip, c: Contract, t: ExecutionContext<Context>) {
  const sorted = Object.keys(zip.files).sort();
  t.deepEqual(sorted, [
    '.gitignore',
    'README.md',
    'contracts/',
    `contracts/${c.name}.sol`,
    'hardhat.config.ts',
    'ignition/',
    'ignition/modules/',
    `ignition/modules/${c.name}.ts`,
    'package-lock.json',
    'package.json',
    'test/',
    'test/test.ts',
    'tsconfig.json',
  ]);
}

async function extractAndRun(zip: JSZip, c: Contract, t: ExecutionContext<Context>) {
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

  const command = `cd "${tempFolder}" && npm install && npx hardhat compile && npx hardhat ignition deploy ignition/modules/${c.name}.ts`;

  const exec = util.promisify(child.exec);
  const result = await exec(command);

  t.regex(result.stdout, /Successfully compiled/);
}

async function assertIgnitionContents(zip: JSZip, c: Contract, t: ExecutionContext<Context>) {
  const contentComparison = [
    await getItemString(zip, `contracts/${c.name}.sol`),
    await getItemString(zip, 'hardhat.config.ts'),
    await getItemString(zip, 'package.json'),
    await getItemString(zip, `ignition/modules/${c.name}.ts`),
    await getItemString(zip, 'test/test.ts'),
    await getItemString(zip, 'README.md'),
    await getItemString(zip, '.gitignore'),
  ];

  t.snapshot(contentComparison);
}

async function getItemString(zip: JSZip, key: string) {
  const obj = zip.files[key];
  if (obj === undefined) {
    throw Error(`Item ${key} not found in zip`);
  }
  return `${key}:\n${await asString(obj)}`;
}

async function asString(item: JSZipObject) {
  return Buffer.from(await item.async('arraybuffer')).toString();
}
