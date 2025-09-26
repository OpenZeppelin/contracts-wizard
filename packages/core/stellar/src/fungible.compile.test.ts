import test from 'ava';

import { buildFungible } from './fungible';
import { runRustCompilationTest } from './utils/compile-test';

test.serial(
  'compilation fungible simple',
  runRustCompilationTest(
    buildFungible,
    {
      kind: 'Fungible',
      name: 'MyToken',
      symbol: 'MTK',
      premint: undefined,
      burnable: false,
      mintable: false,
      pausable: false,
      upgradeable: false,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation fungible full',
  runRustCompilationTest(
    buildFungible,
    {
      kind: 'Fungible',
      name: 'MyToken',
      symbol: 'MTK',
      premint: '2000',
      burnable: true,
      mintable: true,
      pausable: true,
      upgradeable: false,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation fungible burnable',
  runRustCompilationTest(
    buildFungible,
    {
      kind: 'Fungible',
      name: 'MyToken',
      symbol: 'MTK',
      premint: '2000',
      burnable: true,
      mintable: false,
      pausable: false,
      upgradeable: false,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation fungible mintable',
  runRustCompilationTest(
    buildFungible,
    {
      kind: 'Fungible',
      name: 'MyToken',
      symbol: 'MTK',
      premint: '2000',
      burnable: false,
      mintable: true,
      pausable: false,
      upgradeable: false,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation fungible pausable',
  runRustCompilationTest(
    buildFungible,
    {
      kind: 'Fungible',
      name: 'MyToken',
      symbol: 'MTK',
      premint: '2000',
      burnable: false,
      mintable: false,
      pausable: true,
      upgradeable: false,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation fungible burnable mintable',
  runRustCompilationTest(
    buildFungible,
    {
      kind: 'Fungible',
      name: 'MyToken',
      symbol: 'MTK',
      premint: '2000',
      burnable: true,
      mintable: true,
      pausable: false,
      upgradeable: false,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation fungible burnable pausable',
  runRustCompilationTest(
    buildFungible,
    {
      kind: 'Fungible',
      name: 'MyToken',
      symbol: 'MTK',
      premint: '2000',
      burnable: true,
      mintable: false,
      pausable: true,
      upgradeable: false,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation fungible mintable pausable',
  runRustCompilationTest(
    buildFungible,
    {
      kind: 'Fungible',
      name: 'MyToken',
      symbol: 'MTK',
      premint: '2000',
      burnable: false,
      mintable: true,
      pausable: true,
      upgradeable: false,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation fungible upgradable simple',
  runRustCompilationTest(
    buildFungible,
    {
      kind: 'Fungible',
      name: 'MyToken',
      symbol: 'MTK',
      premint: undefined,
      burnable: false,
      mintable: false,
      pausable: false,
      upgradeable: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation fungible upgradable full',
  runRustCompilationTest(
    buildFungible,
    {
      kind: 'Fungible',
      name: 'MyToken',
      symbol: 'MTK',
      premint: '2000',
      burnable: true,
      mintable: true,
      pausable: true,
      upgradeable: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation fungible upgradable burnable',
  runRustCompilationTest(
    buildFungible,
    {
      kind: 'Fungible',
      name: 'MyToken',
      symbol: 'MTK',
      premint: '2000',
      burnable: true,
      mintable: false,
      pausable: false,
      upgradeable: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation fungible upgradable mintable',
  runRustCompilationTest(
    buildFungible,
    {
      kind: 'Fungible',
      name: 'MyToken',
      symbol: 'MTK',
      premint: '2000',
      burnable: false,
      mintable: true,
      pausable: false,
      upgradeable: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation fungible upgradable pausable',
  runRustCompilationTest(
    buildFungible,
    {
      kind: 'Fungible',
      name: 'MyToken',
      symbol: 'MTK',
      premint: '2000',
      burnable: false,
      mintable: false,
      pausable: true,
      upgradeable: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation fungible upgradable burnable mintable',
  runRustCompilationTest(
    buildFungible,
    {
      kind: 'Fungible',
      name: 'MyToken',
      symbol: 'MTK',
      premint: '2000',
      burnable: true,
      mintable: true,
      pausable: false,
      upgradeable: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation fungible upgradable burnable pausable',
  runRustCompilationTest(
    buildFungible,
    {
      kind: 'Fungible',
      name: 'MyToken',
      symbol: 'MTK',
      premint: '2000',
      burnable: true,
      mintable: false,
      pausable: true,
      upgradeable: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation fungible upgradable mintable pausable',
  runRustCompilationTest(
    buildFungible,
    {
      kind: 'Fungible',
      name: 'MyToken',
      symbol: 'MTK',
      premint: '2000',
      burnable: false,
      mintable: true,
      pausable: true,
      upgradeable: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation fungible upgradable mintable pausable with security contact metadata',
  runRustCompilationTest(
    buildFungible,
    {
      kind: 'Fungible',
      name: 'MyToken',
      symbol: 'MTK',
      premint: '2000',
      burnable: false,
      mintable: true,
      pausable: true,
      upgradeable: true,
      info: {
        securityContact: 'contact@security.lol',
      },
    },
    { snapshotResult: false },
  ),
);
