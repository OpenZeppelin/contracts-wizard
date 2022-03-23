import test from 'ava';

import { buildERC1155, ERC1155Options } from './erc1155';
import { printContract } from './print';

function testERC1155(title: string, opts: Partial<ERC1155Options>) {
  test(title, t => {
    const c = buildERC1155({
      name: 'MyToken',
      uri: 'https://gateway.pinata.cloud/ipfs/QmcP9hxrnC1T5ATPmq2saFeAM1ypFX9BnAswCdHB9JCjLA/',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

testERC1155('basic', {});

testERC1155('basic + roles', {
  access: 'roles',
});

testERC1155('burnable', {
  burnable: true,
});

testERC1155('pausable', {
  pausable: true,
});

testERC1155('mintable', {
  mintable: true,
});

testERC1155('mintable + roles', {
  mintable: true,
  access: 'roles',
});

testERC1155('supply tracking', {
  supply: true,
});

testERC1155('full upgradeable transparent', {
  mintable: true,
  access: 'roles',
  burnable: true,
  pausable: true,
  upgradeable: 'transparent',
});

testERC1155('full upgradeable uups', {
  mintable: true,
  access: 'roles',
  burnable: true,
  pausable: true,
  upgradeable: 'uups',
});
