import _test from 'ava';

import { runRustCompilationTest } from './test';
import { buildFungible } from './fungible';
import test from 'ava';

test(
  'rust zip fungible simple',
  runRustCompilationTest(buildFungible, {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: undefined,
    burnable: false,
    mintable: false,
    pausable: false,
    upgradeable: false,
  }),
);

test(
  'rust zip fungible upgradable full',
  runRustCompilationTest(buildFungible, {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: '2000',
    burnable: true,
    mintable: true,
    pausable: true,
    upgradeable: true,
  }),
);
