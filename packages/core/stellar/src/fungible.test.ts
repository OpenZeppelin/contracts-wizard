import test from 'ava';

import { buildFungible, FungibleOptions, getInitialSupply } from './fungible';
import { printContract } from './print';

import { fungible, OptionsError } from '.';

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
    t.is(fungible.print(opts), printContract(buildFungible({
      name: 'MyToken',
      symbol: 'MTK',
      ...opts,
    })));
  });
}

testFungible('basic fungible, non-upgradeable', {
  upgradeable: false,
});

testFungible('basic fungible', {});

testFungible('fungible burnable', {
  burnable: true,
});

testFungible('fungible pausable', {
  pausable: true,
  access: 'ownable',
});

testFungible('fungible pausable with roles', {
  pausable: true,
  access: 'roles',
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
  access: 'ownable',
});

testFungible('fungible mintable with roles', {
  mintable: true,
  access: 'roles',
});

testFungible('fungible votes', {
  votes: true,
  appName: 'MY_DAPP_NAME',
});

testFungible('fungible votes, version', {
  votes: true,
  appName: 'MY_DAPP_NAME',
  appVersion: 'MY_DAPP_VERSION',
});

test('fungible votes, no name', async t => {
  let error = t.throws(() => buildFungible({
    name: 'MyToken',
    symbol: 'MTK',
    votes: true,
  }));
  t.is((error as OptionsError).messages.appName, 'Application Name is required when Votes are enabled');
});

test('fungible votes, empty version', async t => {
  let error = t.throws(() => buildFungible({
    name: 'MyToken',
    symbol: 'MTK',
    votes: true,
    appName: 'MY_DAPP_NAME',
    appVersion: '', // avoids default value of v1
  }));
  t.is((error as OptionsError).messages.appVersion, 'Application Version is required when Votes are enabled');
});

testFungible('fungible votes, non-upgradeable', {
  votes: true,
  appName: 'MY_DAPP_NAME',
  upgradeable: false,
});

testFungible('fungible full, non-upgradeable', {
  premint: '2000',
  access: 'ownable',
  burnable: true,
  mintable: true,
  votes: true,
  pausable: true,
  upgradeable: false,
  appName: 'MY_DAPP_NAME',
  appVersion: 'MY_DAPP_VERSION',
});

testFungible('fungible full upgradeable', {
  premint: '2000',
  access: 'ownable',
  burnable: true,
  mintable: true,
  votes: true,
  pausable: true,
  upgradeable: true,
  appName: 'MY_DAPP_NAME',
  appVersion: 'MY_DAPP_VERSION',
});

testFungible('fungible full upgradeable with roles', {
  premint: '2000',
  access: 'roles',
  burnable: true,
  mintable: true,
  votes: true,
  pausable: true,
  upgradeable: true,
  appName: 'MY_DAPP_NAME',
  appVersion: 'MY_DAPP_VERSION',
});

testAPIEquivalence('fungible API default');

testAPIEquivalence('fungible API basic', { name: 'CustomToken', symbol: 'CTK' });

testAPIEquivalence('fungible API full upgradeable', {
  name: 'CustomToken',
  symbol: 'CTK',
  premint: '2000',
  access: 'roles',
  burnable: true,
  mintable: true,
  votes: true,
  pausable: true,
  upgradeable: true,
  appName: 'MY_DAPP_NAME',
  appVersion: 'MY_DAPP_VERSION',
});

test('fungible API assert defaults', async t => {
  t.is(fungible.print(fungible.defaults), fungible.print());
});

test('fungible API isAccessControlRequired', async t => {
  t.is(fungible.isAccessControlRequired({ mintable: true }), true);
  t.is(fungible.isAccessControlRequired({ pausable: true }), true);
  t.is(fungible.isAccessControlRequired({ upgradeable: true }), true);
});

test('fungible getInitialSupply', async t => {
  t.is(getInitialSupply('1000', 18),   '1000000000000000000000');
  t.is(getInitialSupply('1000.1', 18), '1000100000000000000000');
  t.is(getInitialSupply('.1', 18),     '100000000000000000');
  t.is(getInitialSupply('.01', 2), '1');

  let error = t.throws(() => getInitialSupply('.01', 1));
  t.not(error, undefined);
  t.is((error as OptionsError).messages.premint, 'Too many decimals');

  error = t.throws(() => getInitialSupply('1.1.1', 18));
  t.not(error, undefined);
  t.is((error as OptionsError).messages.premint, 'Not a valid number');
});