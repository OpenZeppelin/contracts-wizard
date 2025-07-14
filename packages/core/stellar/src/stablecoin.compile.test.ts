import test from 'ava';

import { runRustCompilationTest } from './utils/compile-test';

import { buildStablecoin } from './stablecoin';

// test.serial(
//   'compilation basic stablecoin',
//   runRustCompilationTest(buildStablecoin, {
//     kind: 'Stablecoin',
//     name: 'MyStablecoin',
//     symbol: 'MST',
//   }),
// );

// test.serial(
//   'compilation stablecoin burnable',
//   runRustCompilationTest(buildStablecoin, {
//     kind: 'Stablecoin',
//     name: 'MyStablecoin',
//     symbol: 'MST',
//     burnable: true,
//   }),
// );

// test.serial(
//   'compilation stablecoin pausable',
//   runRustCompilationTest(buildStablecoin, {
//     kind: 'Stablecoin',
//     name: 'MyStablecoin',
//     symbol: 'MST',
//     pausable: true,
//   }),
// );

// test.serial(
//   'compilation stablecoin burnable pausable',
//   runRustCompilationTest(buildStablecoin, {
//     kind: 'Stablecoin',
//     name: 'MyStablecoin',
//     symbol: 'MST',
//     burnable: true,
//     pausable: true,
//   }),
// );

test.serial(
  'compilation stablecoin preminted',
  runRustCompilationTest(buildStablecoin, {
    kind: 'Stablecoin',
    name: 'MyStablecoin',
    symbol: 'MST',
    premint: '1000',
  }),
);

// test.serial(
//   'compilation stablecoin premint of 0',
//   runRustCompilationTest(buildStablecoin, {
//     kind: 'Stablecoin',
//     name: 'MyStablecoin',
//     symbol: 'MST',
//     premint: '0',
//   }),
// );

// test.serial(
//   'compilation stablecoin mintable',
//   runRustCompilationTest(buildStablecoin, {
//     kind: 'Stablecoin',
//     name: 'MyStablecoin',
//     symbol: 'MST',
//     mintable: true,
//   }),
// );

test.serial(
  'compilation stablecoin ownable',
  runRustCompilationTest(buildStablecoin, {
    kind: 'Stablecoin',
    name: 'MyStablecoin',
    symbol: 'MST',
    access: 'ownable',
  }),
);

test.serial(
  'compilation stablecoin roles',
  runRustCompilationTest(buildStablecoin, {
    kind: 'Stablecoin',
    name: 'MyStablecoin',
    symbol: 'MST',
    access: 'roles',
  }),
);

// test.serial(
//   'compilation stablecoin allowlist',
//   runRustCompilationTest(buildStablecoin, {
//     kind: 'Stablecoin',
//     name: 'MyStablecoin',
//     symbol: 'MST',
//     limitations: 'allowlist',
//   }),
// );

// test.serial(
//   'compilation stablecoin blocklist',
//   runRustCompilationTest(buildStablecoin, {
//     kind: 'Stablecoin',
//     name: 'MyStablecoin',
//     symbol: 'MST',
//     limitations: 'blocklist',
//   }),
// );

// test.serial(
//   'compilation stablecoin full - ownable, allowlist',
//   runRustCompilationTest(buildStablecoin, {
//     kind: 'Stablecoin',
//     name: 'MyStablecoin',
//     symbol: 'MST',
//     premint: '2000',
//     access: 'ownable',
//     limitations: 'allowlist',
//     burnable: true,
//     mintable: true,
//     pausable: true,
//   }),
// );

// test.serial(
//   'compilation stablecoin full - ownable, blocklist',
//   runRustCompilationTest(buildStablecoin, {
//     kind: 'Stablecoin',
//     name: 'MyStablecoin',
//     symbol: 'MST',
//     premint: '2000',
//     access: 'ownable',
//     limitations: 'blocklist',
//     burnable: true,
//     mintable: true,
//     pausable: true,
//   }),
// );

test.serial(
  'compilation stablecoin full - roles, allowlist',
  runRustCompilationTest(buildStablecoin, {
    kind: 'Stablecoin',
    name: 'MyStablecoin',
    symbol: 'MST',
    premint: '2000',
    access: 'roles',
    limitations: 'allowlist',
    burnable: true,
    mintable: true,
    pausable: true,
  }),
);

test.serial(
  'compilation stablecoin full - roles, blocklist',
  runRustCompilationTest(buildStablecoin, {
    kind: 'Stablecoin',
    name: 'MyStablecoin',
    symbol: 'MST',
    premint: '2000',
    access: 'roles',
    limitations: 'blocklist',
    burnable: true,
    mintable: true,
    pausable: true,
  }),
);

// test.serial(
//   'compilation stablecoin full - complex name',
//   runRustCompilationTest(buildStablecoin, {
//     kind: 'Stablecoin',
//     name: 'Custom  $ Token',
//     symbol: 'MST',
//     premint: '2000',
//     access: 'ownable',
//     burnable: true,
//     mintable: true,
//     pausable: true,
//   }),
// );
