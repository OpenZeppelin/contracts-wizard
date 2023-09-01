import _test, { TestFn, ExecutionContext } from 'ava';

import { zipFoundry } from './zip-foundry';

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

test.serial('erc20 basic', async t => {
  const opts: GenericOptions = { kind: 'ERC20', name: 'My Token', symbol: 'MTK' };
  const c = buildERC20(opts);
  await runTest(c, t, opts);
});

test.serial('erc721 basic', async t => {
  const opts: GenericOptions = { kind: 'ERC721', name: 'My Token', symbol: 'MTK'};
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

async function runTest(c: Contract, t: ExecutionContext<Context>, opts: GenericOptions) {
  const zip = await zipFoundry(c, opts);

  assertLayout(zip, c, t);
  await extractAndRunPackage(zip, c, t);
  await assertContents(zip, c, t);
}

function assertLayout(zip: JSZip, c: Contract, t: ExecutionContext<Context>) {
  const sorted = Object.values(zip.files).map(f => f.name).sort();
  t.deepEqual(sorted, [
    'README.md',
    'script/',
    `script/${c.name}.s.sol`,
    'setup.sh',
    'src/',
    `src/${c.name}.sol`,
    'test/',
    `test/${c.name}.t.sol`,
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

  const setGitUser = 'git init && git config user.email "test@test.test" && git config user.name "Test"';
  const setup = 'bash setup.sh';
  const test = 'forge test';
  const script = `forge script script/${c.name}.s.sol`;

  const exec = (cmd: string) => util.promisify(child.exec)(cmd, { env: { ...process.env, NO_COLOR: '' } });

  const command = `cd "${tempFolder}" && ${setGitUser} && ${setup} && ${test} && ${script}`;
  const result = await exec(command);

  t.regex(result.stdout, /Initializing Foundry project\.\.\.\nDone\./);
  t.regex(result.stdout, /1 passed/);
  t.regex(result.stdout, /deployed to /);

  const rerunCommand = `cd "${tempFolder}" && ${setup}`;
  const rerunResult = await exec(rerunCommand);

  t.regex(rerunResult.stdout, /Foundry project already initialized\./);
}

async function assertContents(zip: JSZip, c: Contract, t: ExecutionContext<Context>) {
  const normalizeVersion = (text: string) => text.replace(/\bv\d+\.\d+\.\d+\b/g, 'vX.Y.Z');

  const contentComparison = [
    normalizeVersion(await getItemString(zip, `setup.sh`)),
    await getItemString(zip, `README.md`),
    await getItemString(zip, `script/${c.name}.s.sol`),
    await getItemString(zip, `src/${c.name}.sol`),
    await getItemString(zip, `test/${c.name}.t.sol`),
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
