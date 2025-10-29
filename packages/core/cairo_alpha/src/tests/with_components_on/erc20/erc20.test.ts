import test from 'ava';

import type { ERC20Options } from '../../../erc20';
import { buildERC20, getInitialSupply, defaults } from '../../../erc20';
import { printContract } from '../../../print';
import { AccessControl, darDefaultOpts, darCustomOpts } from '../../../set-access-control';

import type { OptionsError } from '../../..';
import { erc20 } from '../../..';

const withComponentsMacroON = { withComponents: true };

function testERC20(title: string, opts: Partial<ERC20Options>) {
  test(title, t => {
    const c = buildERC20({
      name: 'MyToken',
      symbol: 'MTK',
      ...opts,
      macros: withComponentsMacroON,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: ERC20Options) {
  const options = opts === undefined ? defaults : opts;
  options.macros = withComponentsMacroON;
  test(title, t => {
    t.is(erc20.print(options), printContract(buildERC20(options)));
  });
}

testERC20('basic erc20, non-upgradeable', {
  upgradeable: false,
});

testERC20('basic erc20', {});

testERC20('erc20 burnable', {
  burnable: true,
});

testERC20('erc20 pausable', {
  pausable: true,
  access: AccessControl.Ownable(),
});

testERC20('erc20 pausable with roles', {
  pausable: true,
  access: AccessControl.Roles(),
});

testERC20('erc20 pausable with roles-DAR (default opts)', {
  pausable: true,
  access: AccessControl.RolesDefaultAdminRules(darDefaultOpts),
});

testERC20('erc20 pausable with roles-DAR (custom opts)', {
  pausable: true,
  access: AccessControl.RolesDefaultAdminRules(darCustomOpts),
});

testERC20('erc20 burnable pausable', {
  burnable: true,
  pausable: true,
});

testERC20('erc20 preminted', {
  premint: '1000',
});

testERC20('erc20 premint of 0', {
  premint: '0',
});

testERC20('erc20 votes, custom decimals', {
  decimals: '6',
});

test('erc20 votes, decimals too high', async t => {
  const error = t.throws(() =>
    buildERC20({
      name: 'MyToken',
      symbol: 'MTK',
      decimals: '256',
    }),
  );
  t.is((error as OptionsError).messages.decimals, 'Value is greater than u8 max value');
});

testERC20('erc20 mintable', {
  mintable: true,
  access: AccessControl.Ownable(),
});

testERC20('erc20 mintable with roles', {
  mintable: true,
  access: AccessControl.Roles(),
});

testERC20('erc20 mintable with roles-DAR (default opts)', {
  mintable: true,
  access: AccessControl.RolesDefaultAdminRules(darDefaultOpts),
});

testERC20('erc20 mintable with roles-DAR (custom opts)', {
  mintable: true,
  access: AccessControl.RolesDefaultAdminRules(darCustomOpts),
});

testERC20('erc20 votes', {
  votes: true,
  appName: 'MY_DAPP_NAME',
});

testERC20('erc20 votes, version', {
  votes: true,
  appName: 'MY_DAPP_NAME',
  appVersion: 'MY_DAPP_VERSION',
});

test('erc20 votes, no name', async t => {
  const error = t.throws(() =>
    buildERC20({
      name: 'MyToken',
      symbol: 'MTK',
      votes: true,
    }),
  );
  t.is((error as OptionsError).messages.appName, 'Application Name is required when Votes are enabled');
});

test('erc20 votes, empty version', async t => {
  const error = t.throws(() =>
    buildERC20({
      name: 'MyToken',
      symbol: 'MTK',
      votes: true,
      appName: 'MY_DAPP_NAME',
      appVersion: '', // avoids default value of v1
    }),
  );
  t.is((error as OptionsError).messages.appVersion, 'Application Version is required when Votes are enabled');
});

testERC20('erc20 votes, non-upgradeable', {
  votes: true,
  appName: 'MY_DAPP_NAME',
  upgradeable: false,
});

testERC20('erc20 full, non-upgradeable', {
  premint: '2000',
  access: AccessControl.Ownable(),
  burnable: true,
  mintable: true,
  votes: true,
  pausable: true,
  upgradeable: false,
  appName: 'MY_DAPP_NAME',
  appVersion: 'MY_DAPP_VERSION',
});

testERC20('erc20 full upgradeable', {
  premint: '2000',
  access: AccessControl.Ownable(),
  burnable: true,
  mintable: true,
  votes: true,
  pausable: true,
  upgradeable: true,
  appName: 'MY_DAPP_NAME',
  appVersion: 'MY_DAPP_VERSION',
});

testERC20('erc20 full upgradeable with roles', {
  premint: '2000',
  access: AccessControl.Roles(),
  burnable: true,
  mintable: true,
  votes: true,
  pausable: true,
  upgradeable: true,
  appName: 'MY_DAPP_NAME',
  appVersion: 'MY_DAPP_VERSION',
});

testERC20('erc20 full upgradeable with roles-DAR (default opts)', {
  premint: '2000',
  access: AccessControl.RolesDefaultAdminRules(darDefaultOpts),
  burnable: true,
  mintable: true,
  votes: true,
  pausable: true,
  upgradeable: true,
  appName: 'MY_DAPP_NAME',
  appVersion: 'MY_DAPP_VERSION',
});

testERC20('erc20 full upgradeable with roles-DAR (custom opts)', {
  premint: '2000',
  access: AccessControl.RolesDefaultAdminRules(darCustomOpts),
  burnable: true,
  mintable: true,
  votes: true,
  pausable: true,
  upgradeable: true,
  appName: 'MY_DAPP_NAME',
  appVersion: 'MY_DAPP_VERSION',
});

testAPIEquivalence('erc20 API default');

testAPIEquivalence('erc20 API basic', { name: 'CustomToken', symbol: 'CTK', decimals: '6' });

testAPIEquivalence('erc20 API full upgradeable', {
  name: 'CustomToken',
  symbol: 'CTK',
  decimals: '6',
  premint: '2000',
  access: AccessControl.Roles(),
  burnable: true,
  mintable: true,
  votes: true,
  pausable: true,
  upgradeable: true,
  appName: 'MY_DAPP_NAME',
  appVersion: 'MY_DAPP_VERSION',
});

test('erc20 API assert defaults', async t => {
  t.is(erc20.print(erc20.defaults), erc20.print());
});

test('erc20 API isAccessControlRequired', async t => {
  t.is(erc20.isAccessControlRequired({ mintable: true }), true);
  t.is(erc20.isAccessControlRequired({ pausable: true }), true);
  t.is(erc20.isAccessControlRequired({ upgradeable: true }), true);
});

test('erc20 getInitialSupply', async t => {
  t.is(getInitialSupply('1000', 18), '1000000000000000000000');
  t.is(getInitialSupply('1000.1', 18), '1000100000000000000000');
  t.is(getInitialSupply('.1', 18), '100000000000000000');
  t.is(getInitialSupply('.01', 2), '1');

  let error = t.throws(() => getInitialSupply('.01', 1));
  t.not(error, undefined);
  t.is((error as OptionsError).messages.premint, 'Too many decimals');

  error = t.throws(() => getInitialSupply('1.1.1', 18));
  t.not(error, undefined);
  t.is((error as OptionsError).messages.premint, 'Not a valid number');
});
