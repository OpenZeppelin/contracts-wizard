import test, { ExecutionContext } from 'ava';

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

async function runTest(c: Contract, t: ExecutionContext<unknown>, opts: GenericOptions) {
  const zip = await zipFoundry(c, opts);

  assertLayout(zip, c, t);
  await extractAndRunPackage(zip, c, t);
  await assertContents(zip, c, t);
}

function assertLayout(zip: JSZip, c: Contract, t: ExecutionContext<unknown>) {
  const sorted = Object.values(zip.files).map(f => f.name).sort();
  t.deepEqual(sorted, [
    '.env',
    '.github/',
    '.github/workflows/',
    '.github/workflows/test.yml',
    '.gitignore',
    'Makefile',
    'README.md',
    'foundry.toml',
    'remappings.txt',
    'scripts/',
    `scripts/${c.name}.s.sol`,
    'src/',
    `src/${c.name}.sol`,
    'test/',
    `test/${c.name}.t.sol`,
  ]);
}

async function extractAndRunPackage(zip: JSZip, c: Contract, t: ExecutionContext<unknown>) {
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

    // append fake private key to .env file
    await fs.appendFile(path.join(tempFolder, '.env'), '0x1');

    const exec = util.promisify(child.exec);
    const result = await exec(`cd "${tempFolder}" && make && forge test && forge script scripts/${c.name}.s.sol`);
    t.regex(result.stdout, /1 passed/);
    t.regex(result.stdout, /Deploying contract to /);
  } finally {
    await rimraf(tempFolder);
  }
}

async function assertContents(zip: JSZip, c: Contract, t: ExecutionContext<unknown>) {
  const contentComparison = [
    await getItemString(zip, `.env`),
    await getItemString(zip, `.github/workflows/test.yml`),
    await getItemString(zip, `.gitignore`),
    await getItemString(zip, `Makefile`),
    await getItemString(zip, `README.md`),
    await getItemString(zip, `foundry.toml`),
    await getItemString(zip, `remappings.txt`),
    await getItemString(zip, `scripts/${c.name}.s.sol`),
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