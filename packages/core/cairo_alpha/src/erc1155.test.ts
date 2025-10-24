import test from 'ava';
import { erc1155 } from '.';

import type { ERC1155Options } from './erc1155';
import { buildERC1155 } from './erc1155';
import { printContract } from './print';
import { royaltyInfoOptions } from './set-royalty-info';
import { AccessControl, darDefaultOpts, darCustomOpts } from './set-access-control';

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
  access: AccessControl.Roles(),
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
  access: AccessControl.Roles(),
});

testERC1155('mintable + roles DAR (default opts)', {
  mintable: true,
  access: AccessControl.RolesDefaultAdminRules(darDefaultOpts),
});

testERC1155('mintable + roles DAR (custom opts)', {
  mintable: true,
  access: AccessControl.RolesDefaultAdminRules(darCustomOpts),
});

testERC1155('royalty info disabled', {
  royaltyInfo: royaltyInfoOptions.disabled,
});

testERC1155('royalty info enabled default + ownable', {
  royaltyInfo: royaltyInfoOptions.enabledDefault,
  access: AccessControl.Ownable(),
});

testERC1155('royalty info enabled default + roles', {
  royaltyInfo: royaltyInfoOptions.enabledDefault,
  access: AccessControl.Roles(),
});

testERC1155('royalty info enabled default + roles-DAR (custom opts)', {
  royaltyInfo: royaltyInfoOptions.enabledDefault,
  access: AccessControl.RolesDefaultAdminRules(darCustomOpts),
});

testERC1155('royalty info enabled custom + ownable', {
  royaltyInfo: royaltyInfoOptions.enabledCustom,
  access: AccessControl.Ownable(),
});

testERC1155('royalty info enabled custom + roles', {
  royaltyInfo: royaltyInfoOptions.enabledCustom,
  access: AccessControl.Roles(),
});

testERC1155('royalty info enabled custom + roles-DAR (default opts)', {
  royaltyInfo: royaltyInfoOptions.enabledCustom,
  access: AccessControl.RolesDefaultAdminRules(darDefaultOpts),
});

testERC1155('royalty info enabled custom + roles-DAR (custom opts)', {
  royaltyInfo: royaltyInfoOptions.enabledCustom,
  access: AccessControl.RolesDefaultAdminRules(darCustomOpts),
});

testERC1155('full non-upgradeable roles', {
  ...allFeaturesON,
  access: AccessControl.Roles(),
  upgradeable: false,
});

testERC1155('full upgradeable roles', {
  ...allFeaturesON,
  access: AccessControl.Roles(),
  upgradeable: true,
});

testERC1155('full non-upgradeable roles-DAR (default opts)', {
  ...allFeaturesON,
  access: AccessControl.RolesDefaultAdminRules(darDefaultOpts),
  upgradeable: false,
});

testERC1155('full non-upgradeable roles-DAR (custom opts)', {
  ...allFeaturesON,
  access: AccessControl.RolesDefaultAdminRules(darCustomOpts),
  upgradeable: false,
});

testERC1155('full upgradeable roles-DAR (default opts)', {
  ...allFeaturesON,
  access: AccessControl.RolesDefaultAdminRules(darDefaultOpts),
  upgradeable: true,
});

testERC1155('full upgradeable roles-DAR (custom opts)', {
  ...allFeaturesON,
  access: AccessControl.RolesDefaultAdminRules(darCustomOpts),
  upgradeable: true,
});

testAPIEquivalence('API default');

testAPIEquivalence('API basic', { name: CUSTOM_NAME, baseUri: BASE_URI });

testAPIEquivalence('API full upgradeable', {
  ...allFeaturesON,
  name: CUSTOM_NAME,
  baseUri: BASE_URI,
  access: AccessControl.Roles(),
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
