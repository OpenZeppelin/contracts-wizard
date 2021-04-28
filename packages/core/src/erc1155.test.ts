import test from 'ava';

import { buildERC1155, ERC1155Options } from './erc1155';
import { printContract } from './print';

function testERC1155(title: string, opts: ERC1155Options) {
  test(title, t => {
    const c = buildERC1155(opts);
    t.snapshot(printContract(c));
  });
}

testERC1155('basic', {
  name: 'MyToken',
  uri: '',
});

testERC1155('basic + roles', {
  name: 'MyToken',
  uri: '',
  access: 'roles',
});

testERC1155('uri', {
  name: 'MyToken',
  uri: 'https://gateway.pinata.cloud/ipfs/QmcP9hxrnC1T5ATPmq2saFeAM1ypFX9BnAswCdHB9JCjLA/',
});

testERC1155('burnable', {
  name: 'MyToken',
  uri: 'https://gateway.pinata.cloud/ipfs/QmcP9hxrnC1T5ATPmq2saFeAM1ypFX9BnAswCdHB9JCjLA/',
  burnable: true,
});

testERC1155('pausable', {
  name: 'MyToken',
  uri: 'https://gateway.pinata.cloud/ipfs/QmcP9hxrnC1T5ATPmq2saFeAM1ypFX9BnAswCdHB9JCjLA/',
  pausable: true,
});

testERC1155('mintable', {
  name: 'MyToken',
  uri: 'https://gateway.pinata.cloud/ipfs/QmcP9hxrnC1T5ATPmq2saFeAM1ypFX9BnAswCdHB9JCjLA/',
  mintable: true,
});

testERC1155('mintable + roles', {
  name: 'MyToken',
  uri: 'https://gateway.pinata.cloud/ipfs/QmcP9hxrnC1T5ATPmq2saFeAM1ypFX9BnAswCdHB9JCjLA/',
  mintable: true,
  access: 'roles',
});
