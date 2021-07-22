import test from 'ava';

import { zipContract } from './zip';
import { buildERC20 } from './erc20';
import { generateOptions } from './generate/sources';
import { buildGeneric } from './build-generic';

test('erc20 basic', t => {
  const c = buildERC20({ name: 'MyToken', symbol: 'MTK' });
  const zip = zipContract(c);
  const files = Object.values(zip.files).map(f => f.name).sort();

  t.deepEqual(files, [
    '@openzeppelin/',
    '@openzeppelin/contracts/',
    '@openzeppelin/contracts/README.md',
    '@openzeppelin/contracts/token/',
    '@openzeppelin/contracts/token/ERC20/',
    '@openzeppelin/contracts/token/ERC20/ERC20.sol',
    '@openzeppelin/contracts/token/ERC20/IERC20.sol',
    '@openzeppelin/contracts/token/ERC20/extensions/',
    '@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol',
    '@openzeppelin/contracts/utils/',
    '@openzeppelin/contracts/utils/Context.sol',
    'MyToken.sol',
  ]);
});

test('can zip all combinations', t => {
  for (const options of generateOptions('all')) {
    const c = buildGeneric(options);
    zipContract(c);
  }
  t.pass();
});
