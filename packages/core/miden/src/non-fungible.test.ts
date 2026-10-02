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

testNonFungible('non-fungible single key', {
  access: 'singleKey',
});

testNonFungible('non-fungible owner-only burning', {
  burnPolicy: 'ownerOnly',
});

testNonFungible('non-fungible pausable', {
  pausable: true,
});

testNonFungible('non-fungible pausable including transfers', {
  pausable: true,
  pausableTransfers: true,
});

testNonFungible('non-fungible allowlist', {
  transferPolicy: 'allowlist',
});

testNonFungible('non-fungible blocklist', {
  transferPolicy: 'blocklist',
});

testNonFungible('non-fungible single key pausable allowlist', {
  access: 'singleKey',
  pausable: true,
  transferPolicy: 'allowlist',
});

testNonFungible('non-fungible roles', {
  access: 'roles',
});

testNonFungible('non-fungible roles pausable blocklist', {
  access: 'roles',
  pausable: true,
  transferPolicy: 'blocklist',
});

testNonFungible('non-fungible switchable transfer policy', {
  switchableTransferPolicy: true,
});

testNonFungible('non-fungible switchable transfer policy roles allowlist pausable', {
  switchableTransferPolicy: true,
  access: 'roles',
  transferPolicy: 'allowlist',
  pausable: true,
});

testNonFungible('non-fungible switchable transfer policy single key', {
  switchableTransferPolicy: true,
  access: 'singleKey',
});

testNonFungible('non-fungible full - complex name', {
  name: 'Custom  $ Collection',
  symbol: 'CC',
  description: 'A "quoted" description',
  logoUri: 'https://example.com/logo.png',
  contractUri: 'https://example.com/collection.json',
  updatableMetadata: true,
  burnPolicy: 'ownerOnly',
  pausable: true,
  pausableTransfers: true,
  switchableTransferPolicy: true,
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
  name: 'CustomCollection',
  symbol: 'CC',
});

testAPIEquivalence('non-fungible API full', {
  name: 'CustomCollection',
  symbol: 'CC',
  description: 'A collection',
  logoUri: 'https://example.com/logo.png',
  contractUri: 'https://example.com/collection.json',
  updatableMetadata: true,
  burnPolicy: 'ownerOnly',
  pausable: true,
  transferPolicy: 'blocklist',
  switchableTransferPolicy: true,
  access: 'ownable',
});

test('non-fungible API assert defaults', async t => {
  t.is(nonFungible.print(nonFungible.defaults), nonFungible.print());
});

test('non-fungible API isAccessControlRequired', async t => {
  t.is(nonFungible.isAccessControlRequired({ burnPolicy: 'ownerOnly' }), true);
  t.is(nonFungible.isAccessControlRequired({ burnPolicy: 'anyHolder' }), false);
  t.is(nonFungible.isAccessControlRequired({ pausable: true, transferPolicy: 'allowlist' }), false);
});

test('non-fungible owner-only burning with single key uses ownable', async t => {
  t.is(
    nonFungible.print({ name: 'MyToken', symbol: 'MTK', burnPolicy: 'ownerOnly', access: 'singleKey' }),
    nonFungible.print({ name: 'MyToken', symbol: 'MTK', burnPolicy: 'ownerOnly', access: 'ownable' }),
  );
});
