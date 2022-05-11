import test from 'ava';

import { buildERC20, ERC20Options } from './erc20';
import { printContract } from './print';

import { printERC20, erc20defaults } from '.';

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

function testERC20API(title: string, opts?: ERC20Options) {
  test(title, t => {
    t.snapshot(printERC20(opts));
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

testERC20('erc20 full upgradeable', {
  premint: '2000',
  decimals: '9',
  burnable: true,
  mintable: true,
  pausable: true,
  upgradeable: true,
});

testERC20API('erc20 API default');

testERC20API('erc20 API basic', { name: 'CustomToken', symbol: 'CTK' });

testERC20API('erc20 API full upgradeable', {
  name: 'CustomToken',
  symbol: 'CTK',
  premint: '2000',
  decimals: '9',
  burnable: true,
  mintable: true,
  pausable: true,
  upgradeable: true,
});

test('erc20 API assert defaults', async t => {
  t.is(printERC20(erc20defaults), printERC20());
});