import test from 'ava';
import { erc1155 } from '.';

import type { ERC1155Options } from './erc1155';
import { buildERC1155 } from './erc1155';
import { printContract } from './print';
import { royaltyInfoOptions } from './set-royalty-info';

const NAME = 'MyToken';
const CUSTOM_NAME = 'CustomToken';
const BASE_URI = 'https://gateway.pinata.cloud/ipfs/QmcP9hxrnC1T5ATPmq2saFeAM1ypFX9BnAswCdHB9JCjLA/';

const allFeaturesON: Partial<ERC1155Options> = {
  mintable: true,
  burnable: true,
  pausable: true,
  royaltyInfo: royaltyInfoOptions.enabledDefault,
  upgradeable: true,
} as const;

function testERC1155(title: string, opts: Partial<ERC1155Options>) {
  test(title, t => {
    const c = buildERC1155({
      name: NAME,
      baseUri: BASE_URI,
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
    t.is(
      erc1155.print(opts),
      printContract(
        buildERC1155({
          name: NAME,
          baseUri: '',
          ...opts,
        }),
      ),
    );
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

testERC1155('royalty info disabled', {
  royaltyInfo: royaltyInfoOptions.disabled,
});

testERC1155('royalty info enabled default + ownable', {
  royaltyInfo: royaltyInfoOptions.enabledDefault,
  access: 'ownable',
});

testERC1155('royalty info enabled default + roles', {
  royaltyInfo: royaltyInfoOptions.enabledDefault,
  access: 'roles',
});

testERC1155('royalty info enabled custom + ownable', {
  royaltyInfo: royaltyInfoOptions.enabledCustom,
  access: 'ownable',
});

testERC1155('royalty info enabled custom + roles', {
  royaltyInfo: royaltyInfoOptions.enabledCustom,
  access: 'roles',
});

testERC1155('full non-upgradeable', {
  ...allFeaturesON,
  access: 'roles',
  upgradeable: false,
});

testERC1155('full upgradeable', {
  ...allFeaturesON,
  access: 'roles',
  upgradeable: true,
});

testAPIEquivalence('API default');

testAPIEquivalence('API basic', { name: CUSTOM_NAME, baseUri: BASE_URI });

testAPIEquivalence('API full upgradeable', {
  ...allFeaturesON,
  name: CUSTOM_NAME,
  baseUri: BASE_URI,
  access: 'roles',
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
  t.is(
    erc1155.isAccessControlRequired({
      royaltyInfo: royaltyInfoOptions.enabledDefault,
    }),
    true,
  );
  t.is(
    erc1155.isAccessControlRequired({
      royaltyInfo: royaltyInfoOptions.enabledCustom,
    }),
    true,
  );
  t.is(erc1155.isAccessControlRequired({ updatableUri: false }), false);
  t.is(erc1155.isAccessControlRequired({}), true); // updatableUri is true by default
});
