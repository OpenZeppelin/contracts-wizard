import test from 'ava';
import { general } from '.';

import { buildGeneral, GeneralOptions } from './general';
import { printContract } from './print';

function testGeneral(title: string, opts: Partial<GeneralOptions>) {
  test(title, t => {
    const c = buildGeneral({
      name: 'MyContract',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
 function testAPIEquivalence(title: string, opts?: GeneralOptions) {
  test(title, t => {
    t.is(general.print(opts), printContract(buildGeneral({
      name: 'MyToken',
      ...opts,
    })));
  });
}

testGeneral('general', {});

testGeneral('pausable', {
  pausable: true,
});

testGeneral('upgradeable transparent', {
  upgradeable: 'transparent',
});

testGeneral('upgradeable uups', {
  upgradeable: 'uups',
});

testGeneral('access control disabled', {
  access: false,
});

testGeneral('access control ownable', {
  access: 'ownable',
});

testGeneral('access control roles', {
  access: 'roles',
});

testGeneral('upgradeable uups with access control disabled', {
  // API should override access to true since it is required for UUPS
  access: false,
  upgradeable: 'uups',
});

testAPIEquivalence('general API default');

testAPIEquivalence('general API basic', { name: 'CustomToken' });

testAPIEquivalence('general API full upgradeable', {
  name: 'CustomToken',
  access: 'roles',
  pausable: true,
  upgradeable: 'uups',
});

test('general API assert defaults', async t => {
  t.is(general.print(general.defaults), general.print());
});