import test from 'ava';
import { stablecoin } from '.';

import type { StablecoinOptions } from './stablecoin';
import { buildStablecoin } from './stablecoin';
import { printContract } from './print';

function testStablecoin(title: string, opts: Partial<StablecoinOptions>) {
  test(title, t => {
    const c = buildStablecoin({
      name: 'MyStablecoin',
      symbol: 'MST',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: StablecoinOptions) {
  test(title, t => {
    t.is(
      stablecoin.print(opts),
      printContract(
        buildStablecoin({
          name: 'MyStablecoin',
          symbol: 'MST',
          ...opts,
        }),
      ),
    );
  });
}

testStablecoin('basic stablecoin', {});

testStablecoin('stablecoin burnable', {
  burnable: true,
});

testStablecoin('stablecoin pausable', {
  pausable: true,
  access: 'ownable',
});

testStablecoin('stablecoin pausable with roles', {
  pausable: true,
  access: 'roles',
});

testStablecoin('stablecoin pausable with managed', {
  pausable: true,
  access: 'managed',
});

testStablecoin('stablecoin burnable pausable', {
  burnable: true,
  pausable: true,
});

testStablecoin('stablecoin preminted', {
  premint: '1000',
});

testStablecoin('stablecoin premint of 0', {
  premint: '0',
});

testStablecoin('stablecoin mintable', {
  mintable: true,
  access: 'ownable',
});

testStablecoin('stablecoin mintable with roles', {
  mintable: true,
  access: 'roles',
});

testStablecoin('stablecoin permit', {
  permit: true,
});

testStablecoin('stablecoin custodian', {
  custodian: true,
});

testStablecoin('stablecoin allowlist', {
  limitations: 'allowlist',
});

testStablecoin('stablecoin blocklist', {
  limitations: 'blocklist',
});

testStablecoin('stablecoin votes', {
  votes: true,
});

testStablecoin('stablecoin votes + blocknumber', {
  votes: 'blocknumber',
});

testStablecoin('stablecoin votes + timestamp', {
  votes: 'timestamp',
});

testStablecoin('stablecoin flashmint', {
  flashmint: true,
});

testStablecoin('stablecoin full', {
  name: 'MyStablecoin',
  symbol: 'MST',
  premint: '2000',
  access: 'roles',
  burnable: true,
  mintable: true,
  pausable: true,
  permit: true,
  votes: true,
  flashmint: true,
  crossChainBridging: 'custom',
  premintChainId: '10',
  limitations: 'allowlist',
  custodian: true,
});

testAPIEquivalence('stablecoin API default');

testAPIEquivalence('stablecoin API basic', {
  name: 'CustomStablecoin',
  symbol: 'CST',
});

testAPIEquivalence('stablecoin API full', {
  name: 'CustomStablecoin',
  symbol: 'CST',
  premint: '2000',
  access: 'roles',
  burnable: true,
  mintable: true,
  pausable: true,
  permit: true,
  votes: true,
  flashmint: true,
  crossChainBridging: 'custom',
  premintChainId: '10',
  limitations: 'allowlist',
  custodian: true,
});

test('stablecoin API assert defaults', async t => {
  t.is(stablecoin.print(stablecoin.defaults), stablecoin.print());
});

test('stablecoin API isAccessControlRequired', async t => {
  t.is(stablecoin.isAccessControlRequired({ mintable: true }), true);
  t.is(stablecoin.isAccessControlRequired({ pausable: true }), true);
  t.is(stablecoin.isAccessControlRequired({ limitations: 'allowlist' }), true);
  t.is(stablecoin.isAccessControlRequired({ limitations: 'blocklist' }), true);
});
