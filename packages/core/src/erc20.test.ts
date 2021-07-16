import test from 'ava';

import { buildERC20, ERC20Options } from './erc20';
import { printContract } from './print';

function testERC20(title: string, opts: ERC20Options) {
  test(title, t => {
    const c = buildERC20(opts);
    t.snapshot(printContract(c));
  });
}

testERC20('basic erc20', {
  name: 'MyToken',
  symbol: 'MTK',
});

testERC20('erc20 with snapshots', {
  name: 'MyToken',
  symbol: 'MTK',
  snapshots: true,
});

testERC20('erc20 burnable', {
  name: 'MyToken',
  symbol: 'MTK',
  burnable: true,
});

testERC20('erc20 burnable with snapshots', {
  name: 'MyToken',
  symbol: 'MTK',
  burnable: true,
  snapshots: true,
});

testERC20('erc20 pausable', {
  name: 'MyToken',
  symbol: 'MTK',
  pausable: true,
  access: 'ownable',
});

testERC20('erc20 pausable with roles', {
  name: 'MyToken',
  symbol: 'MTK',
  pausable: true,
  access: 'roles',
});

testERC20('erc20 burnable pausable', {
  name: 'MyToken',
  symbol: 'MTK',
  burnable: true,
  pausable: true,
});

testERC20('erc20 burnable pausable with snapshots', {
  name: 'MyToken',
  symbol: 'MTK',
  burnable: true,
  pausable: true,
  snapshots: true,
});

testERC20('erc20 preminted', {
  name: 'MyToken',
  symbol: 'MTK',
  premint: '1000',
});

testERC20('erc20 premint of 0', {
  name: 'MyToken',
  symbol: 'MTK',
  premint: '0',
});

testERC20('erc20 mintable', {
  name: 'MyToken',
  symbol: 'MTK',
  mintable: true,
  access: 'ownable',
});

testERC20('erc20 mintable with roles', {
  name: 'MyToken',
  symbol: 'MTK',
  mintable: true,
  access: 'roles',
});

testERC20('erc20 permit', {
  name: 'MyToken',
  symbol: 'MTK',
  permit: true,
});

testERC20('erc20 full upgradeable transparent', {
  name: 'MyToken',
  symbol: 'MTK',
  premint: '2000',
  access: 'roles',
  burnable: true,
  mintable: true,
  pausable: true,
  snapshots: true,
  permit: true,
  upgradeable: 'transparent',
});

testERC20('erc20 full upgradeable uups', {
  name: 'MyToken',
  symbol: 'MTK',
  premint: '2000',
  access: 'roles',
  burnable: true,
  mintable: true,
  pausable: true,
  snapshots: true,
  permit: true,
  upgradeable: 'uups',
});
