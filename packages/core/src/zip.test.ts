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
    'MyToken.sol',
    'openzeppelin-solidity/',
    'openzeppelin-solidity/contracts/',
    'openzeppelin-solidity/contracts/token/',
    'openzeppelin-solidity/contracts/token/ERC20/',
    'openzeppelin-solidity/contracts/token/ERC20/ERC20.sol',
    'openzeppelin-solidity/contracts/token/ERC20/IERC20.sol',
    'openzeppelin-solidity/contracts/token/ERC20/extensions/',
    'openzeppelin-solidity/contracts/token/ERC20/extensions/IERC20Metadata.sol',
    'openzeppelin-solidity/contracts/utils/',
    'openzeppelin-solidity/contracts/utils/Context.sol',
  ]);
});
