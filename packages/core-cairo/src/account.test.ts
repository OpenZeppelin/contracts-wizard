import test from 'ava';

import { buildAccount, AccountOptions } from './account';
import { printContract } from './print';

import { account } from '.';

function testAccount(title: string, opts: Partial<AccountOptions>) {
  test(title, t => {
    const c = buildAccount({
      name: 'MyAccount',
      type: 'stark',
      ...opts,
    });
    t.snapshot(printContract(c, { isAccount: true }));
  });
}

function testEthAccount(title: string, opts: Partial<AccountOptions>) {
  test(title, t => {
    const c = buildAccount({
      name: 'MyAccount',
      type: 'eth',
      ...opts,
    });
    t.snapshot(printContract(c, { isAccount: true }));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: AccountOptions) {
  test(title, t => {
    t.is(account.print(opts), printContract(buildAccount({
      name: 'MyAccount',
      type: 'stark',
      declare: true,
      deploy: true,
      pubkey: true,
      ...opts,
    }), { isAccount: true }));
  });
}

testAccount('basic account, non-upgradeable', {
  upgradeable: false,
});

testAccount('basic account', {});

testAccount('account declarer', {
  declare: true,
});

testAccount('account deployable', {
  deploy: true,
});

testAccount('account public key', {
  pubkey: true,
});

testAccount('account declarer deployable', {
  declare: true,
  deploy: true
});

testAccount('account declarer public key', {
  declare: true,
  pubkey: true
});

testAccount('account deployable public key', {
  deploy: true,
  pubkey: true
});

testAccount('account full, non-upgradeable', {
  name: 'MyAccount',
  type: 'stark',
  declare: true,
  deploy: true,
  pubkey: true,
  upgradeable: false
});

testAccount('account full, upgradeable', {
  name: 'MyAccount',
  type: 'stark',
  declare: true,
  deploy: true,
  pubkey: true,
  upgradeable: true
});

testEthAccount('basic ethAccount, non-upgradeable', {
  upgradeable: false,
});

testEthAccount('basic ethAccount', {});

testEthAccount('ethAccount declarer', {
  declare: true,
});

testEthAccount('ethAccount deployable', {
  deploy: true,
});

testEthAccount('ethAccount public key', {
  pubkey: true,
});

testEthAccount('ethAccount declarer deployable', {
  declare: true,
  deploy: true
});

testEthAccount('ethAccount declarer public key', {
  declare: true,
  pubkey: true
});

testEthAccount('ethAccount deployable public key', {
  deploy: true,
  pubkey: true
});

testEthAccount('ethAccount full, non-upgradeable', {
  name: 'MyAccount',
  type: 'eth',
  declare: true,
  deploy: true,
  pubkey: true,
  upgradeable: false
});

testEthAccount('ethAccount full, upgradeable', {
  name: 'MyAccount',
  type: 'eth',
  declare: true,
  deploy: true,
  pubkey: true,
  upgradeable: true
});

testAPIEquivalence('account API default');

testAPIEquivalence('account API basic', {
  name: 'CustomAccount',
  type: 'stark',
  declare: false,
  deploy: false,
  pubkey: false,
  upgradeable: false,
});

testAPIEquivalence('account API full upgradeable', {
  name: 'CustomAccount',
  type: 'stark',
  declare: true,
  deploy: true,
  pubkey: true,
  upgradeable: true,
});

test('account API assert defaults', async t => {
  t.is(account.print(account.defaults), account.print());
});

test('account API isAccessControlRequired', async t => {
  t.is(account.isAccessControlRequired({ declare: true }), false);
  t.is(account.isAccessControlRequired({ deploy: true }), false);
  t.is(account.isAccessControlRequired({ pubkey: true }), false);
  t.is(account.isAccessControlRequired({ upgradeable: true }), false);
});
