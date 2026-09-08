import test from 'ava';

import type { NonFungibleOptions } from './non-fungible';
import { buildNonFungible } from './non-fungible';
import { printContract } from './print';
import type { OptionsError } from './error';

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

function testNonFungibleError(title: string, opts: Partial<NonFungibleOptions>, field: string) {
  test(title, t => {
    const error = t.throws(() =>
      buildNonFungible({
        name: 'MyToken',
        symbol: 'MTK',
        ...opts,
      }),
    ) as OptionsError;
    t.truthy(error.messages[field], `expected an error on field '${field}': ${JSON.stringify(error.messages)}`);
    t.snapshot(error.messages);
  });
}

testNonFungible('basic non-fungible', {});

testNonFungible('non-fungible with metadata', {
  description: 'An NFT collection issued on Miden',
  logoUri: 'https://example.com/logo.png',
  contractUri: 'https://example.com/collection.json',
});

testNonFungible('non-fungible updatable metadata', {
  updatableMetadata: true,
});

testNonFungible('non-fungible not burnable defaults to ownable', {
  burnable: false,
});

testNonFungible('non-fungible pausable', {
  pausable: true,
});

testNonFungible('non-fungible allowlist', {
  restrictions: 'allowlist',
});

testNonFungible('non-fungible blocklist', {
  restrictions: 'blocklist',
});

testNonFungible('non-fungible ownable', {
  access: 'ownable',
});

testNonFungible('non-fungible ownable pausable allowlist', {
  access: 'ownable',
  pausable: true,
  restrictions: 'allowlist',
  updatableMetadata: true,
});

testNonFungible('non-fungible roles', {
  access: 'roles',
});

testNonFungible('non-fungible roles pausable blocklist', {
  access: 'roles',
  pausable: true,
  restrictions: 'blocklist',
  burnable: false,
});

testNonFungible('non-fungible switchable policies', {
  switchablePolicies: true,
});

testNonFungible('non-fungible switchable policies roles allowlist pausable', {
  switchablePolicies: true,
  access: 'roles',
  restrictions: 'allowlist',
  pausable: true,
});

testNonFungible('non-fungible switchable policies ownable owner-only burning', {
  switchablePolicies: true,
  access: 'ownable',
  burnable: false,
});

testNonFungible('non-fungible full - complex name', {
  name: 'Custom  $ Collection',
  symbol: 'CC',
  description: 'A collection',
  logoUri: 'https://example.com/logo.png',
  contractUri: 'https://example.com/collection.json',
  updatableMetadata: true,
  burnable: false,
  pausable: true,
  restrictions: 'allowlist',
  switchablePolicies: true,
  access: 'roles',
  info: {
    securityContact: 'security@example.com',
    license: 'WTFPL',
  },
});

testNonFungibleError('non-fungible name too long', { name: 'A'.repeat(33) }, 'name');
testNonFungibleError('non-fungible invalid symbol', { symbol: 'MTK1' }, 'symbol');
testNonFungibleError('non-fungible contract URI too long', { contractUri: 'x'.repeat(196) }, 'contractUri');

testAPIEquivalence('non-fungible API default');

testAPIEquivalence('non-fungible API basic', {
  name: 'CustomToken',
  symbol: 'CTK',
});

testAPIEquivalence('non-fungible API full', {
  name: 'CustomToken',
  symbol: 'CTK',
  description: 'A collection',
  logoUri: 'https://example.com/logo.png',
  contractUri: 'https://example.com/collection.json',
  updatableMetadata: true,
  burnable: false,
  pausable: true,
  restrictions: 'blocklist',
  switchablePolicies: true,
  access: 'ownable',
});

test('non-fungible API assert defaults', async t => {
  t.is(nonFungible.print(nonFungible.defaults), nonFungible.print());
});

test('non-fungible API isAccessControlRequired', async t => {
  t.is(nonFungible.isAccessControlRequired({ burnable: false }), true);
  t.is(nonFungible.isAccessControlRequired({ burnable: true }), false);
  t.is(nonFungible.isAccessControlRequired({ pausable: true }), false);
});
