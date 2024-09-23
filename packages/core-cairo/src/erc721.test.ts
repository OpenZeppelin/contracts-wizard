import test from 'ava';

import { buildERC721, ERC721Options } from './erc721';
import { printContract } from './print';

import { erc721 } from '.';

const allFeaturesON: Partial<ERC721Options> = {
  mintable: true,
  burnable: true,
  pausable: true,
  enumerable: true,
  upgradeable: true
} as const;

function testERC721(title: string, opts: Partial<ERC721Options>) {
  test(title, t => {
    const c = buildERC721({
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
 function testAPIEquivalence(title: string, opts?: ERC721Options) {
  test(title, t => {
    t.is(erc721.print(opts), printContract(buildERC721({
      name: 'MyToken',
      symbol: 'MTK',
      ...opts,
    })));
  });
}

testERC721('basic non-upgradeable', {
  upgradeable: false,
});

testERC721('basic', {});

testERC721('base uri', {
  baseUri: 'https://gateway.pinata.cloud/ipfs/QmcP9hxrnC1T5ATPmq2saFeAM1ypFX9BnAswCdHB9JCjLA/',
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

testERC721('full non-upgradeable', {
  ...allFeaturesON,
  upgradeable: false,
});

testERC721('full upgradeable', allFeaturesON);

testAPIEquivalence('API default');

testAPIEquivalence('API basic', { name: 'CustomToken', symbol: 'CTK' });

testAPIEquivalence('API full upgradeable', {
  ...allFeaturesON,
  name: 'CustomToken',
  symbol: 'CTK'
});

test('API assert defaults', async t => {
  t.is(erc721.print(erc721.defaults), erc721.print());
});

test('API isAccessControlRequired', async t => {
  t.is(erc721.isAccessControlRequired({ mintable: true }), true);
  t.is(erc721.isAccessControlRequired({ pausable: true }), true);
  t.is(erc721.isAccessControlRequired({ upgradeable: true }), true);
  t.is(erc721.isAccessControlRequired({ burnable: true }), false);
  t.is(erc721.isAccessControlRequired({ enumerable: true }), false);
});