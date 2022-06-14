import test from 'ava';
import type { OptionsError } from './error';

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
