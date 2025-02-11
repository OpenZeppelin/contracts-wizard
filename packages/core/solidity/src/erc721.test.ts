import test from 'ava';
import { erc721 } from '.';

import { buildERC721, ERC721Options } from './erc721';
import { printContract } from './print';

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

testERC721('basic', {});

testERC721('base uri', {
  baseUri: 'https://gateway.pinata.cloud/ipfs/QmcP9hxrnC1T5ATPmq2saFeAM1ypFX9BnAswCdHB9JCjLA/',
});

testERC721('enumerable', {
  enumerable: true,
});

testERC721('uri storage', {
  uriStorage: true,
});

testERC721('mintable + uri storage', {
  mintable: true,
  uriStorage: true,
});

testERC721('mintable + uri storage + incremental', {
  mintable: true,
  uriStorage: true,
  incremental: true,
});

testERC721('burnable', {
  burnable: true,
});

testERC721('burnable + uri storage', {
  uriStorage: true,
  burnable: true,
});

testERC721('pausable', {
  pausable: true,
});

testERC721('mintable', {
  mintable: true,
});

testERC721('mintable + roles', {
  mintable: true,
  access: 'roles',
});

testERC721('mintable + managed', {
  mintable: true,
  access: 'managed',
});

testERC721('mintable + incremental', {
  mintable: true,
  incremental: true,
});

testERC721('votes', {
  votes: true,
});

testERC721('votes + blocknumber', {
  votes: 'blocknumber',
});

testERC721('votes + timestamp', {
  votes: 'timestamp',
});

testERC721('full upgradeable transparent', {
  mintable: true,
  enumerable: true,
  pausable: true,
  burnable: true,
  votes: true,
  upgradeable: 'transparent',
});

testERC721('full upgradeable uups', {
  mintable: true,
  enumerable: true,
  pausable: true,
  burnable: true,
  votes: true,
  upgradeable: 'uups',
});

testERC721('full upgradeable uups + managed', {
  mintable: true,
  enumerable: true,
  pausable: true,
  burnable: true,
  votes: true,
  upgradeable: 'uups',
  access: 'managed',
});

testAPIEquivalence('API default');

testAPIEquivalence('API basic', { name: 'CustomToken', symbol: 'CTK' });

testAPIEquivalence('API full upgradeable', {
  name: 'CustomToken',
  symbol: 'CTK',
  mintable: true,
  enumerable: true,
  pausable: true,
  burnable: true,
  votes: true,
  upgradeable: 'uups',
});

test('API assert defaults', async t => {
  t.is(erc721.print(erc721.defaults), erc721.print());
});

test('API isAccessControlRequired', async t => {
  t.is(erc721.isAccessControlRequired({ mintable: true }), true);
  t.is(erc721.isAccessControlRequired({ pausable: true }), true);
  t.is(erc721.isAccessControlRequired({ upgradeable: 'uups' }), true);
  t.is(erc721.isAccessControlRequired({ upgradeable: 'transparent' }), false);
});