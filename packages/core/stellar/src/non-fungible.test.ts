import test from 'ava';

import type { NonFungibleOptions } from './non-fungible';
import { buildNonFungible } from './non-fungible';
import { printContract } from './print';
import { OptionsError } from './error';

import { nonFungible } from '.';

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

test('throws error when default royalty exceeds 100%', t => {
  const error = t.throws(
    () =>
      buildNonFungible({
        name: 'MyToken',
        symbol: 'MTK',
        royalties: true,
        defaultRoyaltyBasisPoints: '10001',
      }),
    { instanceOf: OptionsError },
  );

  t.is(error?.messages.defaultRoyaltyBasisPoints, 'Maximum royalty is 10000 basis points (100%)');
});

testNonFungible('basic non-fungible', {});

testNonFungible('non-fungible burnable', {
  burnable: true,
});

testNonFungible('non-fungible votes', {
  votes: true,
});

testNonFungible('non-fungible votes burnable mintable sequential', {
  votes: true,
  burnable: true,
  mintable: true,
  sequential: true,
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

testNonFungible('non-fungible explicit trait implementations', {
  explicitImplementations: true,
});

testNonFungible('non-fungible votes explicit trait implementations', {
  votes: true,
  explicitImplementations: true,
});

testNonFungible('non-fungible custom token uri', {
  tokenUri: 'https://example.com/nfts/',
});

testNonFungible('non-fungible votes enumerable mintable', {
  votes: true,
  enumerable: true,
  mintable: true,
  sequential: true,
});

testNonFungible('non-fungible votes enumerable explicit trait implementations', {
  votes: true,
  enumerable: true,
  burnable: true,
  explicitImplementations: true,
});

testNonFungible('non-fungible votes consecutive', {
  votes: true,
  consecutive: true,
  burnable: true,
});

testNonFungible('non-fungible royalties', {
  royalties: true,
});

testNonFungible('non-fungible royalties with default royalty', {
  royalties: true,
  defaultRoyaltyBasisPoints: '500',
  mintable: true,
});

testNonFungible('non-fungible royalties roles', {
  royalties: true,
  defaultRoyaltyBasisPoints: '1000',
  access: 'roles',
  consecutive: true,
});

testNonFungible('non-fungible royalties explicit trait implementations', {
  royalties: true,
  defaultRoyaltyBasisPoints: '250',
  enumerable: true,
  explicitImplementations: true,
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

testAPIEquivalence('non-fungible API votes', {
  name: 'CustomToken',
  symbol: 'CTK',
  burnable: true,
  mintable: true,
  pausable: true,
  votes: true,
});

test('non-fungible API assert defaults', async t => {
  t.is(nonFungible.print(nonFungible.defaults), nonFungible.print());
});
