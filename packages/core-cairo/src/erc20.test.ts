import test from 'ava';

import { buildERC20, ERC20Options } from './erc20';
import { printContract } from './print';

function testERC20(title: string, opts: Partial<ERC20Options>) {
  test(title, t => {
    const c = buildERC20({
      name: 'MyToken',
      symbol: 'MTK',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

testERC20('basic erc20', {});

testERC20('erc20 burnable', {
  burnable: true,
});

testERC20('erc20 pausable', {
  pausable: true,
  access: 'ownable',
});

testERC20('erc20 burnable pausable', {
  burnable: true,
  pausable: true,
});

testERC20('erc20 preminted', {
  premint: '1000',
});

testERC20('erc20 premint of 0', {
  premint: '0',
});

testERC20('erc20 mintable', {
  mintable: true,
  access: 'ownable',
});

testERC20('erc20 full upgradeable transparent', {
  premint: '2000',
  burnable: true,
  mintable: true,
  pausable: true,
  upgradeable: true,
});

testERC20('erc20 full upgradeable uups', {
  premint: '2000',
  burnable: true,
  mintable: true,
  pausable: true,
  upgradeable: true,
});
