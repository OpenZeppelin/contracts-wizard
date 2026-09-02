import test from 'ava';

import { runRustCompilationTest } from './utils/compile-test';

import { buildAccount } from './account';

// The Account tab has no `explicitImplementations` option: the library does not
// re-export `smart_account::get_signer_id`/`get_policy_id`, so those two
// `SmartAccount` methods cannot be spelled out. See `account.ts`.
const testOptions = { snapshotResult: false, excludeExplicitTraitTest: true };

test.serial(
  'compilation basic account',
  runRustCompilationTest(
    buildAccount,
    {
      kind: 'Account',
      name: 'MyAccount',
    },
    testOptions,
  ),
);

test.serial(
  'compilation account no policy',
  runRustCompilationTest(
    buildAccount,
    {
      kind: 'Account',
      name: 'MyAccount',
      policy: false,
    },
    testOptions,
  ),
);

test.serial(
  'compilation account all signer types',
  runRustCompilationTest(
    buildAccount,
    {
      kind: 'Account',
      name: 'MyAccount',
      ed25519Signers: true,
      webauthnSigners: true,
    },
    testOptions,
  ),
);

test.serial(
  'compilation account weighted threshold all signer types',
  runRustCompilationTest(
    buildAccount,
    {
      kind: 'Account',
      name: 'MyAccount',
      ed25519Signers: true,
      webauthnSigners: true,
      policy: 'weighted-threshold',
    },
    testOptions,
  ),
);

test.serial(
  'compilation account upgradeable',
  runRustCompilationTest(
    buildAccount,
    {
      kind: 'Account',
      name: 'MyAccount',
      upgradeable: true,
      policy: 'weighted-threshold',
    },
    testOptions,
  ),
);

test.serial(
  'compilation account without execution entry point',
  runRustCompilationTest(
    buildAccount,
    {
      kind: 'Account',
      name: 'MyAccount',
      executionEntryPoint: false,
    },
    testOptions,
  ),
);
