import test from 'ava';

import { buildERC721, ERC721Options } from './erc721';
import { printContract } from './print';

function testERC721(title: string, opts: ERC721Options) {
  test(title, t => {
    const c = buildERC721(opts);
    t.snapshot(printContract(c));
  });
}

testERC721('basic', {
  name: 'MyToken',
  symbol: 'MTK',
});

testERC721('enumerable', {
  name: 'MyToken',
  symbol: 'MTK',
  enumerable: true,
});

testERC721('uri storage', {
  name: 'MyToken',
  symbol: 'MTK',
  uriStorage: true,
});

testERC721('burnable', {
  name: 'MyToken',
  symbol: 'MTK',
  burnable: true,
});

testERC721('burnable + uri storage', {
  name: 'MyToken',
  symbol: 'MTK',
  uriStorage: true,
  burnable: true,
});

testERC721('pausable', {
  name: 'MyToken',
  symbol: 'MTK',
  pausable: true,
});
