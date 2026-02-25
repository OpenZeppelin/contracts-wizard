import test from 'ava';
import { erc6909 } from '../../..';

import type { ERC6909Options } from '../../../erc6909';
import { buildERC6909 } from '../../../erc6909';
import { printContract } from '../../../print';
import { AccessControl, darDefaultOpts, darCustomOpts } from '../../../set-access-control';

const NAME = 'MyToken';
const CUSTOM_NAME = 'CustomToken';

const allFeaturesON: Partial<ERC6909Options> = {
  mintable: true,
  burnable: true,
  pausable: true,
  upgradeable: true,
} as const;

function testERC6909(title: string, opts: Partial<ERC6909Options>) {
  test(title, t => {
    const c = buildERC6909({
      name: NAME,
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: ERC6909Options) {
  test(title, t => {
    t.is(
      erc6909.print(opts),
      printContract(
        buildERC6909({
          name: NAME,
          ...opts,
        }),
      ),
    );
  });
}

testERC6909('basic non-upgradeable', {
  upgradeable: false,
});

testERC6909('basic', {});

testERC6909('burnable', {
  burnable: true,
});

testERC6909('pausable', {
  pausable: true,
});

testERC6909('mintable', {
  mintable: true,
});

testERC6909('mintable + roles', {
  mintable: true,
  access: AccessControl.Roles(),
});

testERC6909('mintable + roles-DAR (default opts)', {
  mintable: true,
  access: AccessControl.RolesDefaultAdminRules(darDefaultOpts),
});

testERC6909('mintable + roles-DAR (custom opts)', {
  mintable: true,
  access: AccessControl.RolesDefaultAdminRules(darCustomOpts),
});

testERC6909('full non-upgradeable roles', {
  ...allFeaturesON,
  access: AccessControl.Roles(),
  upgradeable: false,
});

testERC6909('full upgradeable roles', {
  ...allFeaturesON,
  access: AccessControl.Roles(),
  upgradeable: true,
});

testERC6909('full non-upgradeable roles-DAR (default opts)', {
  ...allFeaturesON,
  access: AccessControl.RolesDefaultAdminRules(darDefaultOpts),
  upgradeable: false,
});

testERC6909('full non-upgradeable roles-DAR (custom opts)', {
  ...allFeaturesON,
  access: AccessControl.RolesDefaultAdminRules(darCustomOpts),
  upgradeable: false,
});

testERC6909('full upgradeable roles-DAR (default opts)', {
  ...allFeaturesON,
  access: AccessControl.RolesDefaultAdminRules(darDefaultOpts),
  upgradeable: true,
});

testERC6909('full upgradeable roles-DAR (custom opts)', {
  ...allFeaturesON,
  access: AccessControl.RolesDefaultAdminRules(darCustomOpts),
  upgradeable: true,
});

testAPIEquivalence('API default');

testAPIEquivalence('API basic', { name: CUSTOM_NAME });

testAPIEquivalence('API full upgradeable', {
  ...allFeaturesON,
  name: CUSTOM_NAME,
  access: AccessControl.Roles(),
  upgradeable: true,
});

test('API assert defaults', async t => {
  t.is(erc6909.print(erc6909.defaults), erc6909.print());
});

test('API isAccessControlRequired', async t => {
  t.is(erc6909.isAccessControlRequired({ mintable: true }), true);
  t.is(erc6909.isAccessControlRequired({ pausable: true }), true);
  t.is(erc6909.isAccessControlRequired({ upgradeable: true }), true);
  t.is(erc6909.isAccessControlRequired({ burnable: true }), false);
  t.is(erc6909.isAccessControlRequired({}), false);
});
