import test from 'ava';

import { zipContract } from './zip';
import { buildERC20 } from './erc20';

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
    '@openzeppelin/contracts/utils/',
    '@openzeppelin/contracts/utils/Context.sol',
    'MyToken.sol',
  ]);
});
