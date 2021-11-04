import test from 'ava';

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

testERC721('mintable + incremental', {
  mintable: true,
  incremental: true,
});

testERC721('full upgradeable transparent', {
  mintable: true,
  enumerable: true,
  pausable: true,
  burnable: true,
  upgradeable: 'transparent',
});

testERC721('full upgradeable uups', {
  mintable: true,
  enumerable: true,
  pausable: true,
  burnable: true,
  upgradeable: 'uups',
});
