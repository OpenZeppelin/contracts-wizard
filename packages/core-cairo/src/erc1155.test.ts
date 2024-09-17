import test from 'ava';
import { erc1155 } from '.';

import { buildERC1155, ERC1155Options } from './erc1155';
import { printContract } from './print';

function testERC1155(title: string, opts: Partial<ERC1155Options>) {
  test(title, t => {
    const c = buildERC1155({
      name: 'MyToken',
      baseUri: 'https://gateway.pinata.cloud/ipfs/QmcP9hxrnC1T5ATPmq2saFeAM1ypFX9BnAswCdHB9JCjLA/',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
 function testAPIEquivalence(title: string, opts?: ERC1155Options) {
  test(title, t => {
    t.is(erc1155.print(opts), printContract(buildERC1155({
      name: 'MyToken',
      baseUri: '',
      ...opts,
    })));
  });
}

testERC1155('basic non-upgradeable', {
  upgradeable: false,
});

testERC1155('basic', {});

testERC1155('basic + roles', {
  access: 'roles',
});

testERC1155('no updatable uri', {
  updatableUri: false,
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

testERC1155('full non-upgradeable', {
  mintable: true,
  access: 'roles',
  burnable: true,
  pausable: true,
  upgradeable: false,
});

testERC1155('full upgradeable', {
  mintable: true,
  access: 'roles',
  burnable: true,
  pausable: true,
  upgradeable: true,
});

testAPIEquivalence('API default');

testAPIEquivalence('API basic', { name: 'CustomToken', baseUri: 'https://gateway.pinata.cloud/ipfs/QmcP9hxrnC1T5ATPmq2saFeAM1ypFX9BnAswCdHB9JCjLA/' });

testAPIEquivalence('API full upgradeable', {
  name: 'CustomToken',
  baseUri: 'https://gateway.pinata.cloud/ipfs/QmcP9hxrnC1T5ATPmq2saFeAM1ypFX9BnAswCdHB9JCjLA/',
  mintable: true,
  access: 'roles',
  burnable: true,
  pausable: true,
  upgradeable: true,
});

test('API assert defaults', async t => {
  t.is(erc1155.print(erc1155.defaults), erc1155.print());
});

test('API isAccessControlRequired', async t => {
  t.is(erc1155.isAccessControlRequired({ updatableUri: false, mintable: true }), true);
  t.is(erc1155.isAccessControlRequired({ updatableUri: false, pausable: true }), true);
  t.is(erc1155.isAccessControlRequired({ updatableUri: false, upgradeable: true }), true);
  t.is(erc1155.isAccessControlRequired({ updatableUri: true }), true);
  t.is(erc1155.isAccessControlRequired({ updatableUri: false}), false);
  t.is(erc1155.isAccessControlRequired({}), true); // updatableUri is true by default
});