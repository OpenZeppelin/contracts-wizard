import test from 'ava';
import { general } from '.';

import { buildGeneral, GeneralOptions } from './general';
import { printContract } from './print';

function testGeneral(title: string, opts: Partial<GeneralOptions>) {
  test(title, t => {
    const c = buildGeneral({
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
      ...opts,
    })));
  });
}

testGeneral('general', {});

testGeneral('pausable', {
  pausable: true,
});

testGeneral('upgradeable', {
  upgradeable: true,
});

testGeneral('access control disabled', {
  access: false,
});

testGeneral('access control ownable', {
  access: 'ownable',
});

testGeneral('pausable with access control disabled', {
  // API should override access to true since it is required for pausable
  access: false,
  pausable: true,
});

testAPIEquivalence('general API default');

testAPIEquivalence('general API full upgradeable', {
  access: 'ownable',
  pausable: true,
  upgradeable: true,
});

test('general API assert defaults', async t => {
  t.is(general.print(general.defaults), general.print());
});

test('API isAccessControlRequired', async t => {
  t.is(general.isAccessControlRequired({ pausable: true }), true);
  t.is(general.isAccessControlRequired({ upgradeable: true }), false);
});