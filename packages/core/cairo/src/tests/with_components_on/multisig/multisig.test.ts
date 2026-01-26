import test from 'ava';
import type { OptionsError } from '../../..';
import { multisig } from '../../..';
import type { MultisigOptions } from '../../../multisig';
import { buildMultisig } from '../../../multisig';
import { contractDefaults as commonDefaults } from '../../../common-options';
import { printContract } from '../../../print';

const defaults: MultisigOptions = {
  name: 'MyMultisig',
  quorum: '2',
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info,
  macros: { withComponents: true },
};

const CUSTOM_NAME = 'CustomMultisig';
const CUSTOM_QUORUM = '42';

//
// Test helpers
//

function testMultisig(title: string, opts: Partial<MultisigOptions>) {
  test(title, t => {
    const c = buildMultisig({
      ...defaults,
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

function testAPIEquivalence(title: string, opts?: MultisigOptions) {
  test(title, t => {
    t.is(
      multisig.print(opts),
      printContract(
        buildMultisig({
          ...defaults,
          ...opts,
        }),
      ),
    );
  });
}

//
// Snapshot tests
//

testMultisig('custom name', {
  name: CUSTOM_NAME,
});

testMultisig('custom quorum', {
  quorum: CUSTOM_QUORUM,
});

testMultisig('all custom settings', {
  name: CUSTOM_NAME,
  quorum: CUSTOM_QUORUM,
});

testMultisig('upgradeable', {
  upgradeable: true,
});

testMultisig('non-upgradeable', {
  upgradeable: false,
});

//
// API tests
//

testAPIEquivalence('API custom name', {
  ...defaults,
  name: CUSTOM_NAME,
});

testAPIEquivalence('API custom quorum', {
  ...defaults,
  quorum: CUSTOM_QUORUM,
});

testAPIEquivalence('API all custom settings', {
  ...defaults,
  name: CUSTOM_NAME,
  quorum: CUSTOM_QUORUM,
});

testAPIEquivalence('API upgradeable', {
  ...defaults,
  upgradeable: true,
});

testAPIEquivalence('API non-upgradeable', {
  ...defaults,
  upgradeable: false,
});

test('quorum is 0', async t => {
  const error = t.throws(() =>
    buildMultisig({
      ...defaults,
      quorum: '0',
    }),
  );
  t.is((error as OptionsError).messages.quorum, 'Quorum cannot be 0');
});

test('negative quorum', async t => {
  const error = t.throws(() =>
    buildMultisig({
      ...defaults,
      quorum: '-1',
    }),
  );
  t.is((error as OptionsError).messages.quorum, 'Not a valid number');
});
