import test from 'ava';

import type { NonFungibleOptions } from './non-fungible';
import { buildNonFungible } from './non-fungible';
import { printContract } from './print';
import { OptionsError } from './error';

import { nonFungible } from '.';
import { runRustCompilationTest } from './utils/compile-test';

function testNonFungible(title: string, opts: Partial<NonFungibleOptions>) {
  test(title, t => {
    const c = buildNonFungible({
      name: 'MyToken',
      symbol: 'MTK',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: NonFungibleOptions) {
  test(title, t => {
    t.is(
      nonFungible.print(opts),
      printContract(
        buildNonFungible({
          name: 'MyToken',
          symbol: 'MTK',
          ...opts,
        }),
      ),
    );
  });
}

// Error validation tests
test('throws error when enumerable and consecutive are both enabled', t => {
  const error = t.throws(
    () =>
      buildNonFungible({
        name: 'MyToken',
        symbol: 'MTK',
        enumerable: true,
        consecutive: true,
      }),
    { instanceOf: OptionsError },
  );

  t.is(error?.messages.enumerable, 'Enumerable cannot be used with Consecutive extension');
  t.is(error?.messages.consecutive, 'Consecutive cannot be used with Enumerable extension');
});

test('throws error when consecutive and mintable are both enabled', t => {
  const error = t.throws(
    () =>
      buildNonFungible({
        name: 'MyToken',
        symbol: 'MTK',
        consecutive: true,
        mintable: true,
      }),
    { instanceOf: OptionsError },
  );

  t.is(error?.messages.consecutive, 'Consecutive cannot be used with Mintable extension');
  t.is(error?.messages.mintable, 'Mintable cannot be used with Consecutive extension');
});

test('throws error when consecutive and sequential are both enabled', t => {
  const error = t.throws(
    () =>
      buildNonFungible({
        name: 'MyToken',
        symbol: 'MTK',
        consecutive: true,
        sequential: true,
      }),
    { instanceOf: OptionsError },
  );

  t.is(error?.messages.consecutive, 'Consecutive cannot be used with Sequential minting');
  t.is(error?.messages.sequential, 'Sequential minting cannot be used with Consecutive extension');
});

testNonFungible('basic non-fungible', {});

testNonFungible('non-fungible burnable', {
  burnable: true,
});

testNonFungible('non-fungible pausable', {
  pausable: true,
});

testNonFungible('non-fungible burnable pausable', {
  burnable: true,
  pausable: true,
});

testNonFungible('non-fungible mintable', {
  mintable: true,
});

testNonFungible('non-fungible enumerable', {
  enumerable: true,
});

testNonFungible('non-fungible consecutive', {
  consecutive: true,
});

testNonFungible('non-fungible consecutive burnable', {
  consecutive: true,
  burnable: true,
});

testNonFungible('non-fungible consecutive pausable', {
  consecutive: true,
  pausable: true,
});

testNonFungible('non-fungible consecutive burnable pausable', {
  consecutive: true,
  burnable: true,
  pausable: true,
});

testNonFungible('non-fungible sequential', {
  sequential: true,
});

testNonFungible('non-fungible upgradeable', {
  upgradeable: true,
});

// Revised test with valid combinations
testNonFungible('non-fungible with compatible options', {
  access: 'ownable',
  burnable: true,
  mintable: true,
  pausable: true,
  enumerable: true,
  upgradeable: true,
});

testNonFungible('non-fungible - complex name', {
  name: 'Custom  $ Token',
  access: 'ownable',
  burnable: true,
  pausable: true,
});

testAPIEquivalence('non-fungible API default');

testAPIEquivalence('non-fungible API basic', { name: 'CustomToken', symbol: 'CTK' });

testAPIEquivalence('non-fungible API full', {
  name: 'CustomToken',
  symbol: 'CTK',
  burnable: true,
  mintable: true,
  pausable: true,
  enumerable: true,
  upgradeable: true,
});

test('non-fungible API assert defaults', async t => {
  t.is(nonFungible.print(nonFungible.defaults), nonFungible.print());
});

test(
  'compilation nonfungible simple',
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
    sequential: false,
  }),
);

test(
  'compilation nonfungible full except sequential mintable enumerable',
  runRustCompilationTest(buildNonFungible, {
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
  }),
);

test(
  'compilation nonfungible burnable',
  runRustCompilationTest(buildNonFungible, {
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
  }),
);

test(
  'compilation nonfungible consecutive',
  runRustCompilationTest(buildNonFungible, {
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
  }),
);

test(
  'compilation nonfungible pausable',
  runRustCompilationTest(buildNonFungible, {
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
  }),
);

test(
  'compilation nonfungible upgradeable',
  runRustCompilationTest(buildNonFungible, {
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
  }),
);

test(
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

test(
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

test(
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

test(
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

test(
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

// -- TODO fix build --

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

//--
