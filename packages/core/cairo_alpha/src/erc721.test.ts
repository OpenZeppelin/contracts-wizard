import test from 'ava';

import type { ERC721Options } from './erc721';
import { buildERC721 } from './erc721';
import { printContract } from './print';
import { royaltyInfoOptions } from './set-royalty-info';

import type { OptionsError } from '.';
import { erc721 } from '.';

const NAME = 'MyToken';
const CUSTOM_NAME = 'CustomToken';
const SYMBOL = 'MTK';
const CUSTOM_SYMBOL = 'CTK';
const APP_NAME = 'MY_DAPP_NAME';
const APP_VERSION = 'MY_DAPP_VERSION';
const BASE_URI = 'https://gateway.pinata.cloud/ipfs/QmcP9hxrnC1T5ATPmq2saFeAM1ypFX9BnAswCdHB9JCjLA/';

const allFeaturesON: Partial<ERC721Options> = {
  mintable: true,
  burnable: true,
  pausable: true,
  enumerable: true,
  royaltyInfo: royaltyInfoOptions.enabledDefault,
  votes: true,
  appName: APP_NAME,
  appVersion: APP_VERSION,
  upgradeable: true,
} as const;

function testERC721(title: string, opts: Partial<ERC721Options>) {
  test(title, t => {
    const c = buildERC721({
      name: NAME,
      symbol: SYMBOL,
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: ERC721Options) {
  test(title, t => {
    t.is(
      erc721.print(opts),
      printContract(
        buildERC721({
          name: NAME,
          symbol: SYMBOL,
          ...opts,
        }),
      ),
    );
  });
}

testERC721('basic non-upgradeable', {
  upgradeable: false,
});

testERC721('basic', {});

testERC721('base uri', {
  baseUri: BASE_URI,
});

testERC721('burnable', {
  burnable: true,
});

testERC721('pausable', {
  pausable: true,
});

testERC721('mintable', {
  mintable: true,
});

testERC721('enumerable', {
  enumerable: true,
});

testERC721('pausable + enumerable', {
  pausable: true,
  enumerable: true,
});

testERC721('mintable + roles', {
  mintable: true,
  access: 'roles',
});

testERC721('royalty info disabled', {
  royaltyInfo: royaltyInfoOptions.disabled,
});

testERC721('royalty info enabled default + ownable', {
  royaltyInfo: royaltyInfoOptions.enabledDefault,
  access: 'ownable',
});

testERC721('royalty info enabled default + roles', {
  royaltyInfo: royaltyInfoOptions.enabledDefault,
  access: 'roles',
});

testERC721('royalty info enabled custom + ownable', {
  royaltyInfo: royaltyInfoOptions.enabledCustom,
  access: 'ownable',
});

testERC721('royalty info enabled custom + roles', {
  royaltyInfo: royaltyInfoOptions.enabledCustom,
  access: 'roles',
});

testERC721('full non-upgradeable', {
  ...allFeaturesON,
  upgradeable: false,
});

testERC721('erc721 votes', {
  votes: true,
  appName: APP_NAME,
});

testERC721('erc721 votes, version', {
  votes: true,
  appName: APP_NAME,
  appVersion: APP_VERSION,
});

test('erc721 votes, no name', async t => {
  const error = t.throws(() =>
    buildERC721({
      name: NAME,
      symbol: SYMBOL,
      votes: true,
    }),
  );
  t.is((error as OptionsError).messages.appName, 'Application Name is required when Votes are enabled');
});

test('erc721 votes, no version', async t => {
  const error = t.throws(() =>
    buildERC721({
      name: NAME,
      symbol: SYMBOL,
      votes: true,
      appName: APP_NAME,
      appVersion: '',
    }),
  );
  t.is((error as OptionsError).messages.appVersion, 'Application Version is required when Votes are enabled');
});

test('erc721 votes, empty version', async t => {
  const error = t.throws(() =>
    buildERC721({
      name: NAME,
      symbol: SYMBOL,
      votes: true,
      appName: APP_NAME,
      appVersion: '', // avoids default value of v1
    }),
  );
  t.is((error as OptionsError).messages.appVersion, 'Application Version is required when Votes are enabled');
});

testERC721('erc721 votes, non-upgradeable', {
  votes: true,
  appName: APP_NAME,
  upgradeable: false,
});

testERC721('full upgradeable', allFeaturesON);

testAPIEquivalence('API default');

testAPIEquivalence('API basic', { name: CUSTOM_NAME, symbol: CUSTOM_SYMBOL });

testAPIEquivalence('API full upgradeable', {
  ...allFeaturesON,
  name: CUSTOM_NAME,
  symbol: CUSTOM_SYMBOL,
});

test('API assert defaults', async t => {
  t.is(erc721.print(erc721.defaults), erc721.print());
});

test('API isAccessControlRequired', async t => {
  t.is(erc721.isAccessControlRequired({ mintable: true }), true);
  t.is(erc721.isAccessControlRequired({ pausable: true }), true);
  t.is(erc721.isAccessControlRequired({ upgradeable: true }), true);
  t.is(
    erc721.isAccessControlRequired({
      royaltyInfo: royaltyInfoOptions.enabledDefault,
    }),
    true,
  );
  t.is(
    erc721.isAccessControlRequired({
      royaltyInfo: royaltyInfoOptions.enabledCustom,
    }),
    true,
  );
  t.is(
    erc721.isAccessControlRequired({
      royaltyInfo: royaltyInfoOptions.disabled,
    }),
    false,
  );
  t.is(erc721.isAccessControlRequired({ burnable: true }), false);
  t.is(erc721.isAccessControlRequired({ enumerable: true }), false);
});
