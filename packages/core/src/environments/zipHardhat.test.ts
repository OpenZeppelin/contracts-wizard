import test from 'ava';

import { zipHardhat } from './zipHardhat';

import { buildERC20 } from '../erc20';
import { generateSources } from '../generate/sources';
import { buildGeneric } from '../build-generic';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import util from 'util';
import child from "child_process";

test('erc20 basic', async t => {
  const c = buildERC20({ name: 'MyToken', symbol: 'MTK' });
  const zip = zipHardhat(c);
  const files = Object.values(zip.files).map(f => f.name).sort();

  t.deepEqual(files, [
    '.gitignore',
    'README.md',
    'contracts/',
    'contracts/MyToken.sol',
    'hardhat.config.ts',
    'package-lock.json',
    'package.json',
    'scripts/',
    'scripts/deploy.ts',
    'test/',
    'test/test.ts',
    'tsconfig.json',
  ]);

  let tempFolder = await fs.mkdtemp(path.join(os.tmpdir(), 'openzeppelin-wizard-'));

  const items = Object.values(zip.files);
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
});

test('can zip all combinations', t => {
  for (const { options } of generateSources('all')) {
    const c = buildGeneric(options);
    zipHardhat(c);
  }
  t.pass();
});
