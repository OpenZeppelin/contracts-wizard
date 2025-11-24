import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';

import { zipHardhat } from './zip-hardhat';

import type { ERC7984Options } from './erc7984';
import { buildERC7984 } from './erc7984';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import util from 'util';
import child from 'child_process';
import type { Contract } from '@openzeppelin/wizard';
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

test.serial('erc7984 basic', async t => {
  const opts: GenericOptions = {
    kind: 'ERC7984',
    name: 'My Token',
    contractURI: 'https://example.com',
    networkConfig: 'zama-sepolia',
    symbol: 'MTK',
  };
  const c = buildERC7984(opts);
  await runIgnitionTest(c, t);
});

test.serial('erc7984 full', async t => {
  const fullOptions: Required<ERC7984Options> = {
    name: 'My Token',
    contractURI: 'https://example.com',
    networkConfig: 'zama-sepolia',
    symbol: 'MTK',
    premint: '2000',
    wrappable: true,
    votes: 'timestamp',
    info: {
      license: 'AGPL-3.0-only',
    },
  };
  const opts: GenericOptions = {
    kind: 'ERC7984',
    ...fullOptions,
  };
  const c = buildERC7984(opts);
  await runIgnitionTest(c, t);
});

async function runIgnitionTest(c: Contract, t: ExecutionContext<Context>) {
  const zip = await zipHardhat(c);

  assertIgnitionLayout(zip, c, t);
  await extractAndRunIgnitionPackage(zip, c, t);
  await assertIgnitionContents(zip, c, t);
}

function assertIgnitionLayout(zip: JSZip, c: Contract, t: ExecutionContext<Context>) {
  const sorted = Object.values(zip.files)
    .map(f => f.name)
    .sort();
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

function extractAndRun(makeDeployCommand: (c: Contract) => string | null) {
  return async (zip: JSZip, c: Contract, t: ExecutionContext<Context>) => {
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

    let command = `cd "${tempFolder}" && npm ci && npm test`;
    if (c.constructorArgs === undefined) {
      // only test deploying the contract if there are no constructor args needed
      command += ` && ${makeDeployCommand(c)}`;
    }

    const exec = util.promisify(child.exec);
    const result = await exec(command);

    t.regex(result.stdout, /1 passing/);
    if (c.constructorArgs === undefined) {
      t.regex(result.stdout, /deployed to/);
    }
  };
}

const extractAndRunIgnitionPackage = extractAndRun(c => `npx hardhat ignition deploy ignition/modules/${c.name}.ts`);

async function assertIgnitionContents(zip: JSZip, c: Contract, t: ExecutionContext<Context>) {
  const contentComparison = [
    await getItemString(zip, `contracts/${c.name}.sol`),
    await getItemString(zip, 'hardhat.config.ts'),
    await getItemString(zip, 'package.json'),
    await getItemString(zip, `ignition/modules/${c.name}.ts`),
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
