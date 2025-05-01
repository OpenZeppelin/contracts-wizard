import test from 'ava';

import type { NonFungibleOptions } from './non-fungible';
import { buildNonFungible } from './non-fungible';
import { printContract } from './print';

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

testNonFungible('non-fungible sequential', {
  sequential: true,
});

testNonFungible('non-fungible full', {
  access: 'ownable',
  burnable: true,
  mintable: true,
  pausable: true,
  enumerable: true,
  consecutive: true,
  sequential: true,
});

testNonFungible('non-fungible full - complex name', {
  name: 'Custom  $ Token',
  access: 'ownable',
  burnable: true,
  mintable: true,
  pausable: true,
  enumerable: true,
  consecutive: true,
  sequential: true,
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
  consecutive: true,
  sequential: true,
});

test('non-fungible API assert defaults', async t => {
  t.is(nonFungible.print(nonFungible.defaults), nonFungible.print());
});
