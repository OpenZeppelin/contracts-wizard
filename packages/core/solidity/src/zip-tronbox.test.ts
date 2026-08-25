import type { TestFn, ExecutionContext } from 'ava';
import _test from 'ava';

import { zipTronbox } from './zip-tronbox';

import { buildERC20 } from './erc20';
import { buildERC721 } from './erc721';
import { buildERC1155 } from './erc1155';
import { buildGovernor } from './governor';
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
  t.context.tempFolder = await fs.mkdtemp(path.join(os.tmpdir(), 'openzeppelin-wizard-tronbox-'));
});

test.afterEach.always(async t => {
  await rimraf(t.context.tempFolder);
});

test.serial('erc20 basic', async t => {
  const opts: GenericOptions = {
    kind: 'ERC20',
    name: 'My Token',
    symbol: 'MTK',
  };
  const c = buildERC20(opts);
  await runSnapshotTest(c, t, opts);
});

test.serial('erc20 basic - npm install and compile', async t => {
  const opts: GenericOptions = {
    kind: 'ERC20',
    name: 'My Token',
    symbol: 'MTK',
  };
  const c = buildERC20(opts);
  const zip = await zipTronbox(c, opts);
  await extractAndCompile(zip, t, 'npx tronbox compile');
});

test.serial('erc20 uups upgradeable - npm install and compile', async t => {
  const opts: GenericOptions = {
    kind: 'ERC20',
    name: 'My Token',
    symbol: 'MTK',
    mintable: true,
    access: 'ownable',
    upgradeable: 'uups',
  };
  const c = buildERC20(opts);
  const zip = await zipTronbox(c, opts);
  await extractAndCompile(zip, t, 'npx tronbox compile');
});

test.serial('erc20 mintable+burnable+ownable', async t => {
  const opts: GenericOptions = {
    kind: 'ERC20',
    name: 'My Token',
    symbol: 'MTK',
    premint: '1000',
    access: 'ownable',
    burnable: true,
    mintable: true,
  };
  const c = buildERC20(opts);
  await runSnapshotTest(c, t, opts);
});

test.serial('erc721 basic', async t => {
  const opts: GenericOptions = {
    kind: 'ERC721',
    name: 'My NFT',
    symbol: 'MNFT',
  };
  const c = buildERC721(opts);
  await runSnapshotTest(c, t, opts);
});

test.serial('erc1155 basic', async t => {
  const opts: GenericOptions = {
    kind: 'ERC1155',
    name: 'My Multi',
    uri: 'ipfs://example/{id}',
  };
  const c = buildERC1155(opts);
  await runSnapshotTest(c, t, opts);
});

// Upgradeable zips import the proxy artifacts bundled with the upgrades plugin.
test.serial('erc20 uups upgradeable - proxy migration scaffolding', async t => {
  const opts: GenericOptions = {
    kind: 'ERC20',
    name: 'My Token',
    symbol: 'MTK',
    mintable: true,
    access: 'ownable',
    upgradeable: 'uups',
  };
  const c = buildERC20(opts);
  await runSnapshotTest(c, t, opts);
});

test.serial('erc20 transparent upgradeable - proxy migration scaffolding', async t => {
  const opts: GenericOptions = {
    kind: 'ERC20',
    name: 'My Token',
    symbol: 'MTK',
    mintable: true,
    access: 'ownable',
    upgradeable: 'transparent',
  };
  const c = buildERC20(opts);
  await runSnapshotTest(c, t, opts);
});

test.serial('governor uups upgradeable - non-address init args are gated', async t => {
  const opts: GenericOptions = {
    kind: 'Governor',
    name: 'My Governor',
    delay: '1 day',
    period: '1 week',
    votes: 'erc20votes',
    timelock: 'openzeppelin',
    upgradeable: 'uups',
  };
  const c = buildGovernor(opts);
  await runSnapshotTest(c, t, opts);
});

async function runSnapshotTest(c: Contract, t: ExecutionContext, opts: GenericOptions) {
  const zip = await zipTronbox(c, opts);

  assertLayout(zip, c, t);
  await assertContents(zip, c, t);
}

async function extractAndCompile(zip: JSZip, t: ExecutionContext<Context>, compileCommand: string) {
  const tempFolder = t.context.tempFolder;
  for (const item of Object.values(zip.files)) {
    if (item.dir) {
      await fs.mkdir(path.join(tempFolder, item.name));
    } else {
      await fs.writeFile(path.join(tempFolder, item.name), await asString(item));
    }
  }

  const exec = util.promisify(child.exec);
  const result = await exec(`cd "${tempFolder}" && npm install && ${compileCommand}`, {
    env: { ...process.env, HOME: tempFolder },
  });
  t.true(
    /Compiled \d+ Solidity file/i.test(result.stdout) || /compiled successfully/i.test(result.stdout),
    result.stdout,
  );
}

function assertLayout(zip: JSZip, c: Contract, t: ExecutionContext) {
  const sorted = Object.keys(zip.files).sort();
  const expected = [
    '.gitignore',
    'README.md',
    'contracts/',
    'contracts/Migrations.sol',
    `contracts/${c.name}.sol`,
    ...(c.upgradeable ? ['contracts/ProxyImports.sol'] : []),
    'migrations/',
    'migrations/1_initial_migration.js',
    `migrations/2_deploy_${c.name}.js`,
    'package.json',
    'test/',
    `test/${c.name}.js`,
    'tronbox-config.js',
  ].sort();
  t.deepEqual(sorted, expected);
}

async function assertContents(zip: JSZip, c: Contract, t: ExecutionContext) {
  const contentComparison = [
    await getItemString(zip, `contracts/${c.name}.sol`),
    await getItemString(zip, 'contracts/Migrations.sol'),
    ...(c.upgradeable ? [await getItemString(zip, 'contracts/ProxyImports.sol')] : []),
    await getItemString(zip, 'migrations/1_initial_migration.js'),
    await getItemString(zip, `migrations/2_deploy_${c.name}.js`),
    await getItemString(zip, `test/${c.name}.js`),
    await getItemString(zip, 'tronbox-config.js'),
    await getItemString(zip, 'package.json'),
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
