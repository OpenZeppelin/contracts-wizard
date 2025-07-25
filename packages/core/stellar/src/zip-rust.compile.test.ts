import _test from 'ava';

import { buildFungible } from './fungible';
import test from 'ava';
import { runRustCompilationTest } from './utils/compile-test';

test.serial(
  'rust zip fungible burnable',
  runRustCompilationTest(buildFungible, {
    kind: 'Fungible',
    name: 'MyToken',
    symbol: 'MTK',
    premint: '2000',
    burnable: true,
    mintable: false,
    pausable: false,
    upgradeable: false,
  }),
);
