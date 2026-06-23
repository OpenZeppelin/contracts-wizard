import test from 'ava';

import type { VaultOptions } from './vault';
import { buildVault } from './vault';
import { printContract } from './print';

import { vault } from '.';

function testVault(title: string, opts: Partial<VaultOptions>) {
  test(title, t => {
    const c = buildVault({
      name: 'MyVault',
      symbol: 'MTK',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: VaultOptions) {
  test(title, t => {
    t.is(
      vault.print(opts),
      printContract(
        buildVault({
          name: 'MyVault',
          symbol: 'MTK',
          ...opts,
        }),
      ),
    );
  });
}

testVault('basic vault', {});

testVault('vault pausable', {
  pausable: true,
});

testVault('vault upgradeable', {
  upgradeable: true,
});

testVault('vault pausable upgradeable', {
  pausable: true,
  upgradeable: true,
});

testVault('vault ownable', {
  access: 'ownable',
});

testVault('vault roles', {
  access: 'roles',
});

testVault('vault pausable roles', {
  pausable: true,
  access: 'roles',
});

testVault('vault explicit trait implementations', {
  explicitImplementations: true,
});

testVault('vault pausable explicit trait implementations', {
  pausable: true,
  explicitImplementations: true,
});

testVault('vault full - ownable', {
  access: 'ownable',
  pausable: true,
  upgradeable: true,
});

testVault('vault full - roles', {
  access: 'roles',
  pausable: true,
  upgradeable: true,
});

testVault('vault full - complex name', {
  name: 'Custom  $ Vault',
  access: 'ownable',
  pausable: true,
  upgradeable: true,
});

testAPIEquivalence('vault API default');

testAPIEquivalence('vault API basic', { name: 'CustomVault', symbol: 'CVT' });

testAPIEquivalence('vault API full', {
  name: 'CustomVault',
  symbol: 'CVT',
  access: 'roles',
  pausable: true,
  upgradeable: true,
});

test('vault API assert defaults', async t => {
  t.is(vault.print(vault.defaults), vault.print());
});

test('vault API isAccessControlRequired', async t => {
  t.is(vault.isAccessControlRequired({ pausable: true }), true);
  t.is(vault.isAccessControlRequired({ upgradeable: true }), true);
  t.is(vault.isAccessControlRequired({}), false);
});
