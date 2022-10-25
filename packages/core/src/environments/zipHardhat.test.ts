import test, { ExecutionContext } from 'ava';

import { zipHardhat } from './zipHardhat';

import { buildERC20 } from '../erc20';
import { buildERC721 } from '../erc721';
import { buildERC1155 } from '../erc1155';
import { buildCustom } from '../custom';
import { generateSources } from '../generate/sources';
import { buildGeneric } from '../build-generic';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import util, { promisify } from 'util';
import child from "child_process";
import type { Contract } from '../contract';
import _rimraf from 'rimraf';

const rimraf = promisify(_rimraf);

test('erc20 basic', async t => {
  const c = buildERC20({ name: 'MyToken', symbol: 'MTK' });
  await run(c, t);
});

test('erc721 upgradeable', async t => {
  const c = buildERC721({ name: 'MyToken', symbol: 'MTK', upgradeable: 'uups' });
  await run(c, t);
});

test('erc1155 basic', async t => {
  const c = buildERC1155({ name: 'MyToken', uri: 'https://myuri/{id}'});
  await run(c, t);
});

test('custom upgradeable', async t => {
  const c = buildCustom({ name: 'MyContract', upgradeable: 'transparent' });
  await run(c, t);
});

async function run(c: Contract, t: ExecutionContext<unknown>) {
  const zip = zipHardhat(c);

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

  const files = Object.values(zip.files);

  let tempFolder = await fs.mkdtemp(path.join(os.tmpdir(), 'openzeppelin-wizard-'));
  try {
    const items = Object.values(files);
    for (const item of items) {
      if (item.dir) {
        await fs.mkdir(path.join(tempFolder, item.name));
      } else {
        await fs.writeFile(path.join(tempFolder, item.name), Buffer.from(await item?.async('arraybuffer')));
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

test('can zip all combinations', t => {
  for (const { options } of generateSources('all')) {
    const c = buildGeneric(options);
    zipHardhat(c);
  }
  t.pass();
});
