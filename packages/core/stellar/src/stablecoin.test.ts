import test from 'ava';

import type { StablecoinOptions } from './stablecoin';
import { buildStablecoin } from './stablecoin';
import { printContract } from './print';
import { OptionsError } from './error';

import { stablecoin } from '.';

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

testStablecoin('stablecoin custom decimals with premint', {
  decimals: '18',
  premint: '1000',
});

testStablecoin('stablecoin mintable', {
  mintable: true,
});

testStablecoin('stablecoin votes', {
  votes: true,
});

testStablecoin('stablecoin ownable', {
  access: 'ownable',
});

testStablecoin('stablecoin roles', {
  access: 'roles',
});

testStablecoin('stablecoin allowlist', {
  limitations: 'allowlist',
});

testStablecoin('stablecoin blocklist', {
  limitations: 'blocklist',
});

testStablecoin('stablecoin allowlist explicit trait implementations', {
  limitations: 'allowlist',
  explicitImplementations: true,
});

testStablecoin('stablecoin blocklist explicit trait implementations', {
  limitations: 'blocklist',
  explicitImplementations: true,
});

testStablecoin('stablecoin full - ownable, allowlist', {
  premint: '2000',
  access: 'ownable',
  limitations: 'allowlist',
  burnable: true,
  mintable: true,
  pausable: true,
});

testStablecoin('stablecoin full - ownable, blocklist', {
  premint: '2000',
  access: 'ownable',
  limitations: 'blocklist',
  burnable: true,
  mintable: true,
  pausable: true,
});

testStablecoin('stablecoin full - roles, allowlist', {
  premint: '2000',
  access: 'roles',
  limitations: 'allowlist',
  burnable: true,
  mintable: true,
  pausable: true,
});

testStablecoin('stablecoin full - roles, blocklist', {
  premint: '2000',
  access: 'roles',
  limitations: 'blocklist',
  burnable: true,
  mintable: true,
  pausable: true,
});

testStablecoin('stablecoin full - complex name', {
  name: 'Custom  $ Token',
  premint: '2000',
  access: 'ownable',
  burnable: true,
  mintable: true,
  pausable: true,
});

testStablecoin('stablecoin explicit trait implementations', {
  explicitImplementations: true,
});

testStablecoin('stablecoin allowlist votes', {
  limitations: 'allowlist',
  votes: true,
  burnable: true,
  mintable: true,
});

testStablecoin('stablecoin blocklist votes explicit trait implementations', {
  limitations: 'blocklist',
  votes: true,
  burnable: true,
  explicitImplementations: true,
});

testStablecoin('stablecoin allowlist total supply', {
  limitations: 'allowlist',
  totalSupply: true,
  burnable: true,
  pausable: true,
});

testStablecoin('stablecoin blocklist capped', {
  limitations: 'blocklist',
  cap: '1000000',
  premint: '2000',
  mintable: true,
});

testStablecoin('stablecoin allowlist capped explicit trait implementations', {
  limitations: 'allowlist',
  cap: '1000000',
  burnable: true,
  explicitImplementations: true,
});

test('throws error when votes and total supply are both enabled', t => {
  const error = t.throws(
    () =>
      buildStablecoin({
        name: 'MyStablecoin',
        symbol: 'MST',
        votes: true,
        totalSupply: true,
        limitations: 'allowlist',
      }),
    { instanceOf: OptionsError },
  );

  t.is(error?.messages.votes, 'Votes extension cannot be used with Total Supply extension');
  t.is(error?.messages.totalSupply, 'Total Supply extension cannot be used with Votes extension');
});

testAPIEquivalence('stablecoin API default');

testAPIEquivalence('stablecoin API basic', { name: 'CustomToken', symbol: 'CTK' });

testAPIEquivalence('stablecoin API full', {
  name: 'CustomToken',
  symbol: 'CTK',
  premint: '2000',
  burnable: true,
  mintable: true,
  pausable: true,
});

test('stablecoin API assert defaults', async t => {
  t.is(stablecoin.print(stablecoin.defaults), stablecoin.print());
});
