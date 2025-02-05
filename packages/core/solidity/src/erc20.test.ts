import test from 'ava';
import { erc20 } from '.';

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

/**
 * Tests external API for equivalence with internal API
 */
 function testAPIEquivalence(title: string, opts?: ERC20Options) {
  test(title, t => {
    t.is(erc20.print(opts), printContract(buildERC20({
      name: 'MyToken',
      symbol: 'MTK',
      ...opts,
    })));
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

testERC20('erc20 pausable with roles', {
  pausable: true,
  access: 'roles',
});

testERC20('erc20 pausable with managed', {
  pausable: true,
  access: 'managed',
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

testERC20('erc20 mintable with roles', {
  mintable: true,
  access: 'roles',
});

testERC20('erc20 permit', {
  permit: true,
});

testERC20('erc20 votes', {
  votes: true,
});

testERC20('erc20 votes + blocknumber', {
  votes: 'blocknumber',
});

testERC20('erc20 votes + timestamp', {
  votes: 'timestamp',
});

testERC20('erc20 flashmint', {
  flashmint: true,
});

testERC20('erc20 full upgradeable transparent', {
  premint: '2000',
  access: 'roles',
  burnable: true,
  mintable: true,
  pausable: true,
  permit: true,
  votes: true,
  flashmint: true,
  upgradeable: 'transparent',
});

testERC20('erc20 full upgradeable uups', {
  premint: '2000',
  access: 'roles',
  burnable: true,
  mintable: true,
  pausable: true,
  permit: true,
  votes: true,
  flashmint: true,
  upgradeable: 'uups',
});

testERC20('erc20 full upgradeable uups managed', {
  premint: '2000',
  access: 'managed',
  burnable: true,
  mintable: true,
  pausable: true,
  permit: true,
  votes: true,
  flashmint: true,
  upgradeable: 'uups',
});

testAPIEquivalence('erc20 API default');

testAPIEquivalence('erc20 API basic', { name: 'CustomToken', symbol: 'CTK' });

testAPIEquivalence('erc20 API full upgradeable', {
  name: 'CustomToken',
  symbol: 'CTK',
  premint: '2000',
  access: 'roles',
  burnable: true,
  mintable: true,
  pausable: true,
  permit: true,
  votes: true,
  flashmint: true,
  upgradeable: 'uups',
});

test('erc20 API assert defaults', async t => {
  t.is(erc20.print(erc20.defaults), erc20.print());
});

test('erc20 API isAccessControlRequired', async t => {
  t.is(erc20.isAccessControlRequired({ mintable: true }), true);
  t.is(erc20.isAccessControlRequired({ pausable: true }), true);
  t.is(erc20.isAccessControlRequired({ upgradeable: 'uups' }), true);
  t.is(erc20.isAccessControlRequired({ upgradeable: 'transparent' }), false);
});