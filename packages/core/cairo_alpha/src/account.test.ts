import test from 'ava';

import type { AccountOptions } from './account';
import { buildAccount } from './account';
import { printContract } from './print';

import { account } from '.';

function testAccount(title: string, opts: Partial<AccountOptions>) {
  test(title, t => {
    const c = buildAccount({
      name: 'MyAccount',
      type: 'stark',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

function testEthAccount(title: string, opts: Partial<AccountOptions>) {
  test(title, t => {
    const c = buildAccount({
      name: 'MyAccount',
      type: 'eth',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: AccountOptions) {
  test(title, t => {
    t.is(
      account.print(opts),
      printContract(
        buildAccount({
          name: 'MyAccount',
          type: 'stark',
          declare: true,
          deploy: true,
          pubkey: true,
          outsideExecution: true,
          ...opts,
        }),
      ),
    );
  });
}

testAccount('default full account, mixin + upgradeable', {});

testAccount('default full account, mixin + non-upgradeable', {
  upgradeable: false,
});

testAccount('explicit full account, mixin + upgradeable', {
  name: 'MyAccount',
  type: 'stark',
  declare: true,
  deploy: true,
  pubkey: true,
  outsideExecution: true,
  upgradeable: true,
});

testAccount('explicit full account, mixin + non-upgradeable', {
  name: 'MyAccount',
  type: 'stark',
  declare: true,
  deploy: true,
  pubkey: true,
  outsideExecution: true,
  upgradeable: false,
});

testAccount('basic account, upgradeable', {
  declare: false,
  deploy: false,
  pubkey: false,
  outsideExecution: false,
});

testAccount('basic account, non-upgradeable', {
  declare: false,
  deploy: false,
  pubkey: false,
  outsideExecution: false,
  upgradeable: false,
});

testAccount('account outside execution', {
  deploy: false,
  pubkey: false,
  declare: false,
});

testAccount('account declarer', {
  deploy: false,
  pubkey: false,
  outsideExecution: false,
});

testAccount('account deployable', {
  declare: false,
  pubkey: false,
  outsideExecution: false,
});

testAccount('account public key', {
  declare: false,
  deploy: false,
  outsideExecution: false,
});

testAccount('account declarer, deployable', {
  pubkey: false,
  outsideExecution: false,
});

testAccount('account declarer, public key', {
  deploy: false,
  outsideExecution: false,
});

testAccount('account deployable, public key', {
  declare: false,
  outsideExecution: false,
});

testEthAccount('default full ethAccount, mixin + upgradeable', {});

testEthAccount('default full ethAccount, mixin + non-upgradeable', {
  upgradeable: false,
});

testEthAccount('explicit full ethAccount, mixin + upgradeable', {
  name: 'MyAccount',
  type: 'eth',
  declare: true,
  deploy: true,
  pubkey: true,
  outsideExecution: true,
  upgradeable: true,
});

testEthAccount('explicit full ethAccount, mixin + non-upgradeable', {
  name: 'MyAccount',
  type: 'eth',
  declare: true,
  deploy: true,
  pubkey: true,
  outsideExecution: true,
  upgradeable: false,
});

testEthAccount('basic ethAccount, upgradeable', {
  declare: false,
  deploy: false,
  pubkey: false,
  outsideExecution: false,
});

testEthAccount('basic ethAccount, non-upgradeable', {
  declare: false,
  deploy: false,
  pubkey: false,
  outsideExecution: false,
  upgradeable: false,
});

testEthAccount('ethAccount outside execution', {
  deploy: false,
  pubkey: false,
  declare: false,
});

testEthAccount('ethAccount declarer', {
  deploy: false,
  pubkey: false,
  outsideExecution: false,
});

testEthAccount('ethAccount deployable', {
  declare: false,
  pubkey: false,
  outsideExecution: false,
});

testEthAccount('ethAccount public key', {
  declare: false,
  deploy: false,
  outsideExecution: false,
});

testEthAccount('ethAccount declarer, deployable', {
  pubkey: false,
  outsideExecution: false,
});

testEthAccount('ethAccount declarer, public key', {
  deploy: false,
  outsideExecution: false,
});

testEthAccount('ethAccount deployable, public key', {
  declare: false,
  outsideExecution: false,
});

testAPIEquivalence('account API default');

testAPIEquivalence('account API basic', {
  name: 'CustomAccount',
  type: 'stark',
  declare: false,
  deploy: false,
  pubkey: false,
  outsideExecution: false,
  upgradeable: false,
});

testAPIEquivalence('account API full upgradeable', {
  name: 'CustomAccount',
  type: 'stark',
  declare: true,
  deploy: true,
  pubkey: true,
  outsideExecution: true,
  upgradeable: true,
});

test('account API assert defaults', async t => {
  t.is(account.print(account.defaults), account.print());
});
