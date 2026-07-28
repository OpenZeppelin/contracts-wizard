import test from 'ava';

import type { AccountOptions } from './account';
import { buildAccount } from './account';
import { printContract } from './print';
import { OptionsError } from './error';

import { account } from '.';

function testAccount(title: string, opts: Partial<AccountOptions>) {
  test(title, t => {
    const c = buildAccount({
      name: 'MyAccount',
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
          ...opts,
        }),
      ),
    );
  });
}

testAccount('basic account', {});

testAccount('account delegated signers only', {
  delegatedSigners: true,
  ed25519Signers: false,
  webauthnSigners: false,
});

testAccount('account ed25519 signers only', {
  delegatedSigners: false,
  ed25519Signers: true,
});

testAccount('account webauthn signers only', {
  delegatedSigners: false,
  webauthnSigners: true,
});

testAccount('account all signer types', {
  ed25519Signers: true,
  webauthnSigners: true,
});

testAccount('account no policy', {
  policy: false,
});

testAccount('account weighted threshold', {
  policy: 'weighted-threshold',
});

testAccount('account weighted threshold all signer types', {
  ed25519Signers: true,
  webauthnSigners: true,
  policy: 'weighted-threshold',
});

testAccount('account without execution entry point', {
  executionEntryPoint: false,
});

testAccount('account upgradeable', {
  upgradeable: true,
});

testAccount('account no policy without execution entry point', {
  policy: false,
  executionEntryPoint: false,
});

testAccount('account full', {
  ed25519Signers: true,
  webauthnSigners: true,
  policy: 'weighted-threshold',
  upgradeable: true,
});

testAccount('account full - complex name', {
  name: 'Custom  $ Account',
  ed25519Signers: true,
  webauthnSigners: true,
  policy: 'weighted-threshold',
  upgradeable: true,
});

test('throws error when no signer type is selected', t => {
  const error = t.throws(
    () =>
      buildAccount({
        name: 'MyAccount',
        delegatedSigners: false,
        ed25519Signers: false,
        webauthnSigners: false,
      }),
    { instanceOf: OptionsError },
  );

  t.is(error?.messages.delegatedSigners, 'At least one signer type is required');
});

test('throws error when no signer type is selected even with a policy', t => {
  t.throws(
    () =>
      buildAccount({
        name: 'MyAccount',
        delegatedSigners: false,
        policy: 'simple-threshold',
      }),
    { instanceOf: OptionsError },
  );
});

testAPIEquivalence('account API default');

testAPIEquivalence('account API basic', { name: 'CustomAccount' });

testAPIEquivalence('account API full', {
  name: 'CustomAccount',
  ed25519Signers: true,
  webauthnSigners: true,
  policy: 'weighted-threshold',
  upgradeable: true,
});

test('account API assert defaults', async t => {
  t.is(account.print(account.defaults), account.print());
});
