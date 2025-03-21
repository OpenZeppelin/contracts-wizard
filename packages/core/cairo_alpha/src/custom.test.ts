import test from 'ava';
import { custom } from '.';

import type { CustomOptions } from './custom';
import { buildCustom } from './custom';
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
    t.is(
      custom.print(opts),
      printContract(
        buildCustom({
          name: 'MyContract',
          ...opts,
        }),
      ),
    );
  });
}

testCustom('custom non-upgradeable', {
  upgradeable: false,
});

testCustom('custom defaults', {});

testCustom('pausable', {
  pausable: true,
});

testCustom('upgradeable', {
  upgradeable: true,
});

testCustom('access control disabled', {
  upgradeable: false,
  access: false,
});

testCustom('access control ownable', {
  access: 'ownable',
});

testCustom('access control roles', {
  access: 'roles',
});

testCustom('pausable with access control disabled', {
  // API should override access to true since it is required for pausable
  access: false,
  pausable: true,
  upgradeable: false,
});

testAPIEquivalence('custom API default');

testAPIEquivalence('custom API full upgradeable', {
  name: 'CustomContract',
  access: 'roles',
  pausable: true,
  upgradeable: true,
});

test('custom API assert defaults', async t => {
  t.is(custom.print(custom.defaults), custom.print());
});

test('API isAccessControlRequired', async t => {
  t.is(custom.isAccessControlRequired({ pausable: true }), true);
  t.is(custom.isAccessControlRequired({ upgradeable: true }), true);
});
