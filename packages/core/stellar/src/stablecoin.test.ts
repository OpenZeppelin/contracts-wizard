import test from 'ava';

import type { StablecoinOptions } from './stablecoin';
import { buildStablecoin } from './stablecoin';
import { printContract } from './print';

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

testStablecoin('stablecoin mintable', {
  mintable: true,
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
