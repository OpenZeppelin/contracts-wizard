import test from 'ava';

import type { FungibleOptions } from './fungible';
import { buildFungible } from './fungible';
import { printContract } from './print';
import type { OptionsError } from './error';

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

function testFungibleError(title: string, opts: Partial<FungibleOptions>, field: string) {
  test(title, t => {
    const error = t.throws(() =>
      buildFungible({
        name: 'MyToken',
        symbol: 'MTK',
        ...opts,
      }),
    ) as OptionsError;
    t.truthy(error.messages[field], `expected an error on field '${field}': ${JSON.stringify(error.messages)}`);
    t.snapshot(error.messages);
  });
}

testFungible('basic fungible', {});

testFungible('fungible with decimals and max supply', {
  decimals: '2',
  maxSupply: '21000000.5',
});

testFungible('fungible with metadata', {
  description: 'A token issued on Miden',
  logoUri: 'https://example.com/logo.png',
  externalLink: 'https://example.com',
});

testFungible('fungible updatable metadata and max supply', {
  updatableMetadata: true,
  updatableMaxSupply: true,
});

testFungible('fungible single key', {
  access: 'singleKey',
});

testFungible('fungible owner-only burning', {
  burnPolicy: 'ownerOnly',
});

testFungible('fungible owner-only burning with single key uses ownable', {
  burnPolicy: 'ownerOnly',
  access: 'singleKey',
});

testFungible('fungible pausable', {
  pausable: true,
});

testFungible('fungible pausable including transfers', {
  pausable: true,
  pausableTransfers: true,
});

testFungible('fungible single key pausable including transfers', {
  access: 'singleKey',
  pausable: true,
  pausableTransfers: true,
});

testFungible('fungible allowlist', {
  transferPolicy: 'allowlist',
});

testFungible('fungible blocklist', {
  transferPolicy: 'blocklist',
});

testFungible('fungible single key blocklist', {
  access: 'singleKey',
  transferPolicy: 'blocklist',
});

testFungible('fungible ownable pausable blocklist owner-only burning', {
  access: 'ownable',
  pausable: true,
  transferPolicy: 'blocklist',
  burnPolicy: 'ownerOnly',
});

testFungible('fungible roles', {
  access: 'roles',
});

testFungible('fungible roles pausable allowlist', {
  access: 'roles',
  pausable: true,
  transferPolicy: 'allowlist',
});

testFungible('fungible minimum burn amount', {
  burnPolicy: 'minimumAmount',
  minBurnAmount: '10',
});

testFungible('fungible minimum burn amount single key', {
  decimals: '2',
  burnPolicy: 'minimumAmount',
  minBurnAmount: '0.5',
  access: 'singleKey',
});

testFungible('fungible switchable transfer policy', {
  switchableTransferPolicy: true,
});

testFungible('fungible switchable transfer policy single key', {
  switchableTransferPolicy: true,
  access: 'singleKey',
});

testFungible('fungible switchable transfer policy blocklist', {
  switchableTransferPolicy: true,
  transferPolicy: 'blocklist',
});

testFungible('fungible switchable transfer policy pausable including transfers', {
  switchableTransferPolicy: true,
  pausable: true,
  pausableTransfers: true,
});

testFungible('fungible switchable transfer policy roles minimum burn amount pausable', {
  switchableTransferPolicy: true,
  access: 'roles',
  burnPolicy: 'minimumAmount',
  minBurnAmount: '1',
  pausable: true,
});

testFungible('fungible full - complex name', {
  name: 'Custom  $ Token',
  symbol: 'CTK',
  decimals: '12',
  maxSupply: '1000',
  description: 'A "quoted" description',
  logoUri: 'https://example.com/logo.png',
  externalLink: 'https://example.com',
  updatableMetadata: true,
  updatableMaxSupply: true,
  burnPolicy: 'ownerOnly',
  pausable: true,
  transferPolicy: 'blocklist',
  switchableTransferPolicy: true,
  access: 'roles',
  info: {
    securityContact: 'security@example.com',
    license: 'WTFPL',
  },
});

testFungibleError('fungible name too long', { name: 'A'.repeat(33) }, 'name');
testFungibleError('fungible lowercase symbol', { symbol: 'mtk' }, 'symbol');
testFungibleError('fungible symbol too long', { symbol: 'ABCDEFGHIJKLM' }, 'symbol');
testFungibleError('fungible too many decimals', { decimals: '13' }, 'decimals');
testFungibleError('fungible invalid decimals', { decimals: 'abc' }, 'decimals');
testFungibleError('fungible max supply empty', { maxSupply: '' }, 'maxSupply');
testFungibleError('fungible max supply zero', { maxSupply: '0' }, 'maxSupply');
testFungibleError('fungible max supply too precise', { maxSupply: '1.123', decimals: '2' }, 'maxSupply');
testFungibleError('fungible max supply too large', { maxSupply: '92233720368', decimals: '8' }, 'maxSupply');
testFungibleError('fungible description too long', { description: 'x'.repeat(196) }, 'description');
testFungibleError(
  'fungible min burn amount exceeds max supply',
  { maxSupply: '100', burnPolicy: 'minimumAmount', minBurnAmount: '101' },
  'minBurnAmount',
);
testFungibleError(
  'fungible min burn amount invalid',
  { burnPolicy: 'minimumAmount', minBurnAmount: 'ten' },
  'minBurnAmount',
);
testFungibleError(
  'fungible min burn amount zero',
  { burnPolicy: 'minimumAmount', minBurnAmount: '0' },
  'minBurnAmount',
);
testFungibleError('fungible minimum amount policy without amount', { burnPolicy: 'minimumAmount' }, 'minBurnAmount');
testFungibleError('fungible min burn amount without minimum amount policy', { minBurnAmount: '1' }, 'minBurnAmount');
testFungibleError(
  'fungible min burn amount with owner-only burning',
  { minBurnAmount: '1', burnPolicy: 'ownerOnly' },
  'minBurnAmount',
);
testFungibleError('fungible multiple errors', { symbol: 'mtk', decimals: '99', logoUri: 'x'.repeat(196) }, 'symbol');

testAPIEquivalence('fungible API default');

testAPIEquivalence('fungible API basic', {
  name: 'CustomToken',
  symbol: 'CTK',
});

testAPIEquivalence('fungible API full', {
  name: 'CustomToken',
  symbol: 'CTK',
  decimals: '6',
  maxSupply: '500000',
  description: 'A token',
  logoUri: 'https://example.com/logo.png',
  externalLink: 'https://example.com',
  updatableMetadata: true,
  updatableMaxSupply: true,
  burnPolicy: 'ownerOnly',
  pausable: true,
  pausableTransfers: true,
  transferPolicy: 'allowlist',
  switchableTransferPolicy: true,
  access: 'roles',
});

testAPIEquivalence('fungible API minimum burn amount', {
  name: 'CustomToken',
  symbol: 'CTK',
  burnPolicy: 'minimumAmount',
  minBurnAmount: '25',
  switchableTransferPolicy: true,
});

test('fungible API assert defaults', async t => {
  t.is(fungible.print(fungible.defaults), fungible.print());
});

test('fungible API isAccessControlRequired', async t => {
  t.is(fungible.isAccessControlRequired({ burnPolicy: 'ownerOnly' }), true);
  t.is(fungible.isAccessControlRequired({ burnPolicy: 'anyHolder' }), false);
  t.is(fungible.isAccessControlRequired({ burnPolicy: 'minimumAmount', minBurnAmount: '10' }), false);
  t.is(fungible.isAccessControlRequired({ pausable: true, transferPolicy: 'blocklist' }), false);
  t.is(fungible.isAccessControlRequired({ switchableTransferPolicy: true }), false);
});

test('fungible blank min burn amount with any holder burning is no minimum', async t => {
  t.is(fungible.print({ name: 'MyToken', symbol: 'MTK', minBurnAmount: ' ' }), fungible.print());
});

test('fungible pausable transfers without pausable are ignored', async t => {
  t.is(fungible.print({ name: 'MyToken', symbol: 'MTK', pausableTransfers: true }), fungible.print());
});

test('fungible pausable transfers are implied by a transfer policy', async t => {
  t.is(
    fungible.print({
      name: 'MyToken',
      symbol: 'MTK',
      pausable: true,
      transferPolicy: 'allowlist',
      pausableTransfers: true,
    }),
    fungible.print({ name: 'MyToken', symbol: 'MTK', pausable: true, transferPolicy: 'allowlist' }),
  );
});
