import test from 'ava';

import { runRustCompilationTest } from './utils/compile-test';

import { buildVault } from './vault';

test.serial(
  'compilation basic vault',
  runRustCompilationTest(
    buildVault,
    {
      kind: 'Vault',
      name: 'MyVault',
      symbol: 'MTK',
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation vault pausable',
  runRustCompilationTest(
    buildVault,
    {
      kind: 'Vault',
      name: 'MyVault',
      symbol: 'MTK',
      pausable: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation vault upgradeable',
  runRustCompilationTest(
    buildVault,
    {
      kind: 'Vault',
      name: 'MyVault',
      symbol: 'MTK',
      upgradeable: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation vault ownable',
  runRustCompilationTest(
    buildVault,
    {
      kind: 'Vault',
      name: 'MyVault',
      symbol: 'MTK',
      access: 'ownable',
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation vault roles',
  runRustCompilationTest(
    buildVault,
    {
      kind: 'Vault',
      name: 'MyVault',
      symbol: 'MTK',
      access: 'roles',
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation vault full - ownable',
  runRustCompilationTest(
    buildVault,
    {
      kind: 'Vault',
      name: 'MyVault',
      symbol: 'MTK',
      access: 'ownable',
      pausable: true,
      upgradeable: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation vault full - roles',
  runRustCompilationTest(
    buildVault,
    {
      kind: 'Vault',
      name: 'MyVault',
      symbol: 'MTK',
      access: 'roles',
      pausable: true,
      upgradeable: true,
    },
    { snapshotResult: false },
  ),
);
