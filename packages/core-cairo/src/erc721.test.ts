import test from 'ava';

import { buildERC721, ERC721Options } from './erc721';
import { printContract } from './print';

import { printERC721, erc721defaults } from '.';

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
    t.is(printERC721(opts), printContract(buildERC721({
      name: 'MyToken',
      symbol: 'MTK',
      ...opts,
    })));
  });
}

testERC721('basic', {});

testERC721('burnable', {
  burnable: true,
});

testERC721('pausable', {
  pausable: true,
});

testERC721('mintable', {
  mintable: true,
});

testERC721('full upgradeable', {
  mintable: true,
  pausable: true,
  burnable: true,
  upgradeable: true,
});

testAPIEquivalence('API default');

testAPIEquivalence('API basic', { name: 'CustomToken', symbol: 'CTK' });

testAPIEquivalence('API full upgradeable', {
  name: 'CustomToken',
  symbol: 'CTK',
  burnable: true,
  mintable: true,
  pausable: true,
  upgradeable: true,
});

test('API assert defaults', async t => {
  t.is(printERC721(erc721defaults), printERC721());
});