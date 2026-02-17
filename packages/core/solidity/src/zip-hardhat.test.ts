import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';

import { zipHardhat } from './zip-hardhat';

import { buildERC20 } from './erc20';
import { buildERC721 } from './erc721';
import { buildERC1155 } from './erc1155';
import { buildCustom } from './custom';
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
import { buildAccount } from './account';

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

test.serial('erc20 ownable, uups, crossChainBridging custom', async t => {
  const opts: GenericOptions = {
    kind: 'ERC20',
    name: 'My Token',
    symbol: 'MTK',
    premint: '2000',
    access: 'ownable',
    burnable: true,
    mintable: true,
    pausable: true,
    permit: true,
    votes: true,
    flashmint: true,
    crossChainBridging: 'custom',
    premintChainId: '10',
    upgradeable: 'uups',
  };
  const c = buildERC20(opts);
  await runDeployScriptTest(c, t, opts);
});

test.serial('erc721 upgradeable', async t => {
  const opts: GenericOptions = {
    kind: 'ERC721',
    name: 'My Token',
    symbol: 'MTK',
    upgradeable: 'uups',
  };
  const c = buildERC721(opts);
  await runDeployScriptTest(c, t, opts);
});

test.serial('erc1155 basic', async t => {
  const opts: GenericOptions = {
    kind: 'ERC1155',
    name: 'My Token',
    uri: 'https://myuri/{id}',
  };
  const c = buildERC1155(opts);
  await runIgnitionTest(c, t, opts);
});

test.serial('account ecdsa', async t => {
  const opts: GenericOptions = { kind: 'Account', name: 'My Account', signer: 'ECDSA' };
  const c = buildAccount(opts);
  await runIgnitionTest(c, t, opts);
});

test.serial('account ecdsa uups', async t => {
  const opts: GenericOptions = { kind: 'Account', name: 'My Account', signer: 'ECDSA', upgradeable: 'uups' };
  const c = buildAccount(opts);
  await runDeployScriptTest(c, t, opts);
});

test.serial('custom basic', async t => {
  const opts: GenericOptions = { kind: 'Custom', name: 'My Contract' };
  const c = buildCustom(opts);
  await runIgnitionTest(c, t, opts);
});

test.serial('custom upgradeable', async t => {
  const opts: GenericOptions = {
    kind: 'Custom',
    name: 'My Contract',
    upgradeable: 'transparent',
  };
  const c = buildCustom(opts);
  await runDeployScriptTest(c, t, opts);
});

async function runDeployScriptTest(c: Contract, t: ExecutionContext<Context>, opts: GenericOptions) {
  const zip = await zipHardhat(c, opts);

  assertDeployScriptLayout(zip, c, t);
  await extractAndRunDeployScriptPackage(zip, c, t);
  await assertDeployScriptContents(zip, c, t);
}

async function runIgnitionTest(c: Contract, t: ExecutionContext<Context>, opts: GenericOptions) {
  const zip = await zipHardhat(c, opts);

  assertIgnitionLayout(zip, c, t);
  await extractAndRunIgnitionPackage(zip, c, t);
  await assertIgnitionContents(zip, c, t);
}

function assertDeployScriptLayout(zip: JSZip, c: Contract, t: ExecutionContext<Context>) {
  const sorted = Object.keys(zip.files).sort();
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

const extractAndRunDeployScriptPackage = extractAndRun(() => 'npx hardhat run scripts/deploy.ts');
const extractAndRunIgnitionPackage = extractAndRun(c => `npx hardhat ignition deploy ignition/modules/${c.name}.ts`);

async function assertDeployScriptContents(zip: JSZip, c: Contract, t: ExecutionContext<Context>) {
  const contentComparison = [
    await getItemString(zip, `contracts/${c.name}.sol`),
    await getItemString(zip, 'hardhat.config.ts'),
    await getItemString(zip, 'package.json'),
    await getItemString(zip, 'scripts/deploy.ts'),
    await getItemString(zip, 'test/test.ts'),
  ];

  t.snapshot(contentComparison);
}

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
