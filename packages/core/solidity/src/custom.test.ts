import test from 'ava';
import { custom } from '.';

import { buildCustom, CustomOptions } from './custom';
import { printContract } from './print';

function testCustom(title: string, opts: Partial<CustomOptions>) {
  test(title, t => {
    const c = buildCustom({
      name: 'MyContract',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
 function testAPIEquivalence(title: string, opts?: CustomOptions) {
  test(title, t => {
    t.is(custom.print(opts), printContract(buildCustom({
      name: 'MyContract',
      ...opts,
    })));
  });
}

testCustom('custom', {});

testCustom('pausable', {
  pausable: true,
});

testCustom('upgradeable transparent', {
  upgradeable: 'transparent',
});

testCustom('upgradeable uups', {
  upgradeable: 'uups',
});

testCustom('access control disabled', {
  access: false,
});

testCustom('access control ownable', {
  access: 'ownable',
});

testCustom('access control roles', {
  access: 'roles',
});

testCustom('access control managed', {
  access: 'managed',
});

testCustom('upgradeable uups with access control disabled', {
  // API should override access to true since it is required for UUPS
  access: false,
  upgradeable: 'uups',
});

testAPIEquivalence('custom API default');

testAPIEquivalence('custom API basic', { name: 'CustomContract' });

testAPIEquivalence('custom API full upgradeable', {
  name: 'CustomContract',
  access: 'roles',
  pausable: true,
  upgradeable: 'uups',
});

testAPIEquivalence('custom API full upgradeable with managed', {
  name: 'CustomContract',
  access: 'managed',
  pausable: true,
  upgradeable: 'uups',
});

test('custom API assert defaults', async t => {
  t.is(custom.print(custom.defaults), custom.print());
});

test('API isAccessControlRequired', async t => {
  t.is(custom.isAccessControlRequired({ pausable: true }), true);
  t.is(custom.isAccessControlRequired({ upgradeable: 'uups' }), true);
  t.is(custom.isAccessControlRequired({ upgradeable: 'transparent' }), false);
});