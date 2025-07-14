import test from 'ava';

import { buildNonFungible } from './non-fungible';
import { runRustCompilationTest } from './utils/compile-test';

// test.serial(
//   'compilation nonfungible simple',
//   runRustCompilationTest(buildNonFungible, {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: false,
//     enumerable: false,
//     consecutive: false,
//     pausable: false,
//     upgradeable: false,
//     mintable: false,
//     sequential: false,
//   }),
// );

// test.serial(
//   'compilation nonfungible full except sequential mintable enumerable',
//   runRustCompilationTest(buildNonFungible, {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: true,
//     enumerable: false,
//     consecutive: true,
//     pausable: true,
//     upgradeable: true,
//     mintable: false,
//     sequential: false,
//   }),
// );

// test.serial(
//   'compilation nonfungible burnable',
//   runRustCompilationTest(buildNonFungible, {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: true,
//     enumerable: false,
//     consecutive: false,
//     pausable: false,
//     upgradeable: false,
//     mintable: false,
//     sequential: false,
//   }),
// );

// test.serial(
//   'compilation nonfungible consecutive',
//   runRustCompilationTest(buildNonFungible, {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: false,
//     enumerable: false,
//     consecutive: true,
//     pausable: false,
//     upgradeable: false,
//     mintable: false,
//     sequential: false,
//   }),
// );

// test.serial(
//   'compilation nonfungible pausable',
//   runRustCompilationTest(buildNonFungible, {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: false,
//     enumerable: false,
//     consecutive: false,
//     pausable: true,
//     upgradeable: false,
//     mintable: false,
//     sequential: false,
//   }),
// );

// test.serial(
//   'compilation nonfungible upgradeable',
//   runRustCompilationTest(buildNonFungible, {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: false,
//     enumerable: false,
//     consecutive: false,
//     pausable: false,
//     upgradeable: true,
//     mintable: false,
//     sequential: false,
//   }),
// );

test.serial(
  'compilation nonfungible sequential',
  runRustCompilationTest(buildNonFungible, {
    kind: 'NonFungible',
    name: 'MyNFT',
    symbol: 'MNFT',
    burnable: false,
    enumerable: false,
    consecutive: false,
    pausable: false,
    upgradeable: false,
    mintable: false,
    sequential: true,
  }),
);

test.serial(
  'compilation nonfungible burnable pausable',
  runRustCompilationTest(buildNonFungible, {
    kind: 'NonFungible',
    name: 'MyNFT',
    symbol: 'MNFT',
    burnable: true,
    enumerable: false,
    consecutive: false,
    pausable: true,
    upgradeable: false,
    mintable: false,
    sequential: false,
  }),
);

test.serial(
  'compilation nonfungible enumerable',
  runRustCompilationTest(buildNonFungible, {
    kind: 'NonFungible',
    name: 'MyNFT',
    symbol: 'MNFT',
    burnable: false,
    enumerable: true,
    consecutive: false,
    pausable: false,
    upgradeable: false,
    mintable: false,
    sequential: false,
  }),
);

test.serial(
  'compilation nonfungible burnable enumerable',
  runRustCompilationTest(buildNonFungible, {
    kind: 'NonFungible',
    name: 'MyNFT',
    symbol: 'MNFT',
    burnable: true,
    enumerable: true,
    consecutive: false,
    pausable: false,
    upgradeable: false,
    mintable: false,
    sequential: false,
  }),
);

test.serial(
  'compilation nonfungible full except consecutive',
  runRustCompilationTest(buildNonFungible, {
    kind: 'NonFungible',
    name: 'MyNFT',
    symbol: 'MNFT',
    burnable: true,
    enumerable: true,
    consecutive: false,
    pausable: true,
    upgradeable: true,
    mintable: true,
    sequential: true,
  }),
);

// test('compilation nonfungible mintable', async t => {
//   const opts: GenericOptions = {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: false,
//     enumerable: false,
//     consecutive: false,
//     pausable: false,
//     upgradeable: false,
//     mintable: true,
//     sequential: false,
//   };
//   const c = buildNonFungible(opts);
//   await runTest(t, c, opts);
// });

// test('compilation nonfungible mintable upgradeable', async t => {
//   const opts: GenericOptions = {
//     kind: 'NonFungible',
//     name: 'MyNFT',
//     symbol: 'MNFT',
//     burnable: false,
//     enumerable: false,
//     consecutive: false,
//     pausable: false,
//     upgradeable: true,
//     mintable: true,
//     sequential: false,
//   };
//   const c = buildNonFungible(opts);
//   await runTest(t, c, opts);
// });
