import test from 'ava';

import { zipHardhat } from './zipHardhat';

import { buildERC20 } from '../erc20';
import { generateSources } from '../generate/sources';
import { buildGeneric } from '../build-generic';

test('erc20 basic', t => {
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
});

test('can zip all combinations', t => {
  for (const { options } of generateSources('all')) {
    const c = buildGeneric(options);
    zipHardhat(c);
  }
  t.pass();
});
