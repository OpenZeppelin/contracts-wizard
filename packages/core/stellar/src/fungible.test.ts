import test from 'ava';

import type { FungibleOptions } from './fungible';
import { buildFungible, getInitialSupply } from './fungible';
import { printContract } from './print';

import type { OptionsError } from '.';
import { fungible } from '.';

function testFungible(title: string, opts: Partial<FungibleOptions>) {
  test(title, t => {
    const c = buildFungible({
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
function testAPIEquivalence(title: string, opts?: FungibleOptions) {
  test(title, t => {
    t.is(
      fungible.print(opts),
      printContract(
        buildFungible({
          name: 'MyToken',
          symbol: 'MTK',
          ...opts,
        }),
      ),
    );
  });
}

testFungible('basic fungible', {});

testFungible('fungible burnable', {
  burnable: true,
});

testFungible('fungible pausable', {
  pausable: true,
});

testFungible('fungible burnable pausable', {
  burnable: true,
  pausable: true,
});

testFungible('fungible preminted', {
  premint: '1000',
});

testFungible('fungible premint of 0', {
  premint: '0',
});

testFungible('fungible mintable', {
  mintable: true,
});

testFungible('fungible ownable', {
  access: 'ownable',
});

testFungible('fungible roles', {
  access: 'roles',
});

testFungible('fungible full - ownable', {
  premint: '2000',
  access: 'ownable',
  burnable: true,
  mintable: true,
  pausable: true,
});

testFungible('fungible full - roles', {
  premint: '2000',
  access: 'roles',
  burnable: true,
  mintable: true,
  pausable: true,
});

testFungible('fungible full - complex name', {
  name: 'Custom  $ Token',
  premint: '2000',
  access: 'ownable',
  burnable: true,
  mintable: true,
  pausable: true,
});

testAPIEquivalence('fungible API default');

testAPIEquivalence('fungible API basic', { name: 'CustomToken', symbol: 'CTK' });

testAPIEquivalence('fungible API full', {
  name: 'CustomToken',
  symbol: 'CTK',
  premint: '2000',
  burnable: true,
  mintable: true,
  pausable: true,
});

test('fungible API assert defaults', async t => {
  t.is(fungible.print(fungible.defaults), fungible.print());
});

test('fungible getInitialSupply', async t => {
  t.is(getInitialSupply('1000', 18), '1000000000000000000000');
  t.is(getInitialSupply('1000.1', 18), '1000100000000000000000');
  t.is(getInitialSupply('.1', 18), '100000000000000000');
  t.is(getInitialSupply('.01', 2), '1');

  let error = t.throws(() => getInitialSupply('.01', 1));
  t.not(error, undefined);
  t.is((error as OptionsError).messages.premint, 'Too many decimals');

  error = t.throws(() => getInitialSupply('1.1.1', 18));
  t.not(error, undefined);
  t.is((error as OptionsError).messages.premint, 'Not a valid number');
});
