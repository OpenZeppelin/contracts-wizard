import test from 'ava';
import { custom } from '.';

import type { CustomOptions } from './custom';
import { buildCustom } from './custom';
import { printContract } from './print';
import { AccessControl, darDefaultOpts, darCustomOpts } from './set-access-control';

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
  access: AccessControl.None,
});

testCustom('access control ownable', {
  access: AccessControl.Ownable,
});

testCustom('access control roles', {
  access: AccessControl.Roles,
});

testCustom('access control roles default admin rules (default opts)', {
  access: AccessControl.RolesDefaultAdminRules(darDefaultOpts),
});

testCustom('access control roles default admin rules (custom opts)', {
  access: AccessControl.RolesDefaultAdminRules(darCustomOpts),
});

testCustom('pausable with access control disabled', {
  // API should override access to true since it is required for pausable
  access: AccessControl.None,
  pausable: true,
  upgradeable: false,
});

testAPIEquivalence('custom API default');

testAPIEquivalence('custom API full upgradeable', {
  name: 'CustomContract',
  access: AccessControl.Roles,
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
