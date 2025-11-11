import test from 'ava';

import { buildNonFungible } from './non-fungible';
import { runRustCompilationTest } from './utils/compile-test';

test('non- fungible compile placeholder', t => t.pass());

test.serial(
  'compilation nonfungible simple',
  runRustCompilationTest(
    buildNonFungible,
    {
      kind: 'NonFungible',
      name: 'MyNFT',
      symbol: 'MNFT',
      burnable: false,
      enumerable: false,
      consecutive: false,
      pausable: false,
      upgradeable: false,
      mintable: false,
      sequential: false,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation nonfungible full except sequential mintable enumerable',
  runRustCompilationTest(
    buildNonFungible,
    {
      kind: 'NonFungible',
      name: 'MyNFT',
      symbol: 'MNFT',
      burnable: true,
      enumerable: false,
      consecutive: true,
      pausable: true,
      upgradeable: true,
      mintable: false,
      sequential: false,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation nonfungible burnable',
  runRustCompilationTest(
    buildNonFungible,
    {
      kind: 'NonFungible',
      name: 'MyNFT',
      symbol: 'MNFT',
      burnable: true,
      enumerable: false,
      consecutive: false,
      pausable: false,
      upgradeable: false,
      mintable: false,
      sequential: false,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation nonfungible consecutive',
  runRustCompilationTest(
    buildNonFungible,
    {
      kind: 'NonFungible',
      name: 'MyNFT',
      symbol: 'MNFT',
      burnable: false,
      enumerable: false,
      consecutive: true,
      pausable: false,
      upgradeable: false,
      mintable: false,
      sequential: false,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation nonfungible pausable',
  runRustCompilationTest(
    buildNonFungible,
    {
      kind: 'NonFungible',
      name: 'MyNFT',
      symbol: 'MNFT',
      burnable: false,
      enumerable: false,
      consecutive: false,
      pausable: true,
      upgradeable: false,
      mintable: false,
      sequential: false,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation nonfungible upgradeable',
  runRustCompilationTest(
    buildNonFungible,
    {
      kind: 'NonFungible',
      name: 'MyNFT',
      symbol: 'MNFT',
      burnable: false,
      enumerable: false,
      consecutive: false,
      pausable: false,
      upgradeable: true,
      mintable: false,
      sequential: false,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation nonfungible sequential',
  runRustCompilationTest(
    buildNonFungible,
    {
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
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation nonfungible burnable pausable',
  runRustCompilationTest(
    buildNonFungible,
    {
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
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation nonfungible explicit trait implementations',
  runRustCompilationTest(
    buildNonFungible,
    {
      kind: 'NonFungible',
      name: 'MyNFT',
      symbol: 'MNFT',
      burnable: false,
      enumerable: false,
      consecutive: false,
      pausable: false,
      upgradeable: false,
      mintable: false,
      sequential: false,
      explicitImplementations: true,
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation nonfungible enumerable',
  runRustCompilationTest(
    buildNonFungible,
    {
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
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation nonfungible burnable enumerable',
  runRustCompilationTest(
    buildNonFungible,
    {
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
    },
    { snapshotResult: false },
  ),
);

test.serial(
  'compilation nonfungible full except consecutive',
  runRustCompilationTest(
    buildNonFungible,
    {
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
    },
    { snapshotResult: false },
  ),
);

const explicitNonFungibleCases: Array<{ title: string; options: Parameters<typeof buildNonFungible>[0] }> = [
  {
    title: 'compilation nonfungible full except sequential mintable enumerable explicit trait implementations',
    options: {
      kind: 'NonFungible',
      name: 'MyNFT',
      symbol: 'MNFT',
      burnable: true,
      enumerable: false,
      consecutive: true,
      pausable: true,
      upgradeable: true,
      mintable: false,
      sequential: false,
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation nonfungible burnable explicit trait implementations',
    options: {
      kind: 'NonFungible',
      name: 'MyNFT',
      symbol: 'MNFT',
      burnable: true,
      enumerable: false,
      consecutive: false,
      pausable: false,
      upgradeable: false,
      mintable: false,
      sequential: false,
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation nonfungible consecutive explicit trait implementations',
    options: {
      kind: 'NonFungible',
      name: 'MyNFT',
      symbol: 'MNFT',
      burnable: false,
      enumerable: false,
      consecutive: true,
      pausable: false,
      upgradeable: false,
      mintable: false,
      sequential: false,
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation nonfungible pausable explicit trait implementations',
    options: {
      kind: 'NonFungible',
      name: 'MyNFT',
      symbol: 'MNFT',
      burnable: false,
      enumerable: false,
      consecutive: false,
      pausable: true,
      upgradeable: false,
      mintable: false,
      sequential: false,
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation nonfungible upgradeable explicit trait implementations',
    options: {
      kind: 'NonFungible',
      name: 'MyNFT',
      symbol: 'MNFT',
      burnable: false,
      enumerable: false,
      consecutive: false,
      pausable: false,
      upgradeable: true,
      mintable: false,
      sequential: false,
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation nonfungible sequential explicit trait implementations',
    options: {
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
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation nonfungible burnable pausable explicit trait implementations',
    options: {
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
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation nonfungible enumerable explicit trait implementations',
    options: {
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
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation nonfungible burnable enumerable explicit trait implementations',
    options: {
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
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation nonfungible mintable explicit trait implementations',
    options: {
      kind: 'NonFungible',
      name: 'MyNFT',
      symbol: 'MNFT',
      burnable: false,
      enumerable: false,
      consecutive: false,
      pausable: false,
      upgradeable: false,
      mintable: true,
      sequential: false,
      explicitImplementations: true,
    },
  },
  {
    title: 'compilation nonfungible full except consecutive explicit trait implementations',
    options: {
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
      explicitImplementations: true,
    },
  },
];

for (const { title, options } of explicitNonFungibleCases) {
  test.serial(title, runRustCompilationTest(buildNonFungible, options, { snapshotResult: false }));
}
