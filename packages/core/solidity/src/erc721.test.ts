import test from 'ava';
import { erc721 } from '.';

import type { ERC721Options } from './erc721';
import { buildERC721 } from './erc721';
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
    t.is(
      erc721.print(opts),
      printContract(
        buildERC721({
          name: 'MyToken',
          symbol: 'MTK',
          ...opts,
        }),
      ),
    );
  });
}

testERC721('basic', {});

testERC721('name is unicodeSafe', { name: 'MyTokeć' });

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

testERC721('custom name + upgradeable uups + mintable + incremental', {
  name: 'My NFT Token',
  mintable: true,
  incremental: true,
  votes: true,
  upgradeable: 'uups',
});

testERC721('custom name + upgradeable transparent + mintable + incremental + namespacePrefix', {
  name: 'My NFT Token',
  mintable: true,
  incremental: true,
  votes: true,
  upgradeable: 'transparent',
  namespacePrefix: 'myNftProject',
});

testERC721('upgradeable transparent + mintable + incremental + empty namespacePrefix', {
  mintable: true,
  incremental: true,
  votes: true,
  upgradeable: 'transparent',
  namespacePrefix: '',
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

testERC721('full upgradeable uups + managed + incremental', {
  mintable: true,
  enumerable: true,
  pausable: true,
  burnable: true,
  incremental: true,
  votes: true,
  upgradeable: 'uups',
  access: 'managed',
});

testERC721('full upgradeable uups + managed + incremental + empty namespacePrefix', {
  mintable: true,
  enumerable: true,
  pausable: true,
  burnable: true,
  incremental: true,
  votes: true,
  upgradeable: 'uups',
  access: 'managed',
  namespacePrefix: '',
});

testERC721('erc721 crossChainBridging erc7786native', {
  crossChainBridging: 'erc7786native',
});

testERC721('erc721 crossChainBridging erc7786native allowOverride', {
  crossChainBridging: 'erc7786native',
  crossChainLinkAllowOverride: true,
});

testERC721('erc721 crossChainBridging erc7786native ownable', {
  crossChainBridging: 'erc7786native',
  access: 'ownable',
});

testERC721('erc721 crossChainBridging erc7786native ownable mintable burnable', {
  crossChainBridging: 'erc7786native',
  access: 'ownable',
  mintable: true,
  burnable: true,
});

testERC721('erc721 crossChainBridging erc7786native mintable incremental', {
  crossChainBridging: 'erc7786native',
  mintable: true,
  incremental: true,
});

testERC721('erc721 crossChainBridging erc7786native roles', {
  crossChainBridging: 'erc7786native',
  access: 'roles',
});

testERC721('erc721 crossChainBridging erc7786native managed', {
  crossChainBridging: 'erc7786native',
  access: 'managed',
});

testERC721('erc721 crossChainBridging erc7786native pausable votes enumerable', {
  crossChainBridging: 'erc7786native',
  pausable: true,
  votes: true,
  enumerable: true,
});

testERC721('erc721 crossChainBridging erc7786native upgradeable', {
  crossChainBridging: 'erc7786native',
  upgradeable: 'transparent',
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
  t.is(erc721.isAccessControlRequired({ crossChainBridging: 'erc7786native' }), true);
  t.is(erc721.isAccessControlRequired({ crossChainBridging: false }), false);
});
