import test from 'ava';

import type { ERC20Options } from '../../../erc20';
import { buildERC20, defaults, flashMintDefaults, getInitialSupply } from '../../../erc20';
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
  const options = { ...(opts === undefined ? defaults : opts), macros: withComponentsMacroON };
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

testERC20('erc20 wrapper', {
  wrapper: true,
});

testERC20('erc20 flash mint', {
  flashmint: { ...flashMintDefaults, enabled: true },
});

testERC20('erc20 flash mint with custom max', {
  flashmint: { ...flashMintDefaults, enabled: true, maxAmount: '1000000' },
});

testERC20('erc20 flash mint with percent fee', {
  flashmint: { ...flashMintDefaults, enabled: true, feeMode: 'percent', feePercent: '5' },
});

testERC20('erc20 flash mint with fractional percent fee', {
  flashmint: { ...flashMintDefaults, enabled: true, feeMode: 'percent', feePercent: '0.0013725' },
});

testERC20('erc20 flash mint with percent fee and fee receiver', {
  flashmint: {
    ...flashMintDefaults,
    enabled: true,
    feeMode: 'percent',
    feePercent: '5',
    feeDestination: 'fee_receiver',
  },
});

testERC20('erc20 flash mint with custom fee impl', {
  flashmint: { ...flashMintDefaults, enabled: true, feeMode: 'custom' },
});

testERC20('erc20 flash mint with all custom config', {
  flashmint: {
    enabled: true,
    maxAmount: '1000000',
    feeMode: 'percent',
    feePercent: '5',
    feeDestination: 'fee_receiver',
  },
});

testERC20('erc20 flash mint with max amount of zero', {
  flashmint: { ...flashMintDefaults, enabled: true, maxAmount: '0' },
});

test('erc20 flash mint, max amount empty string', async t => {
  const error = t.throws(() =>
    buildERC20({
      name: 'MyToken',
      symbol: 'MTK',
      flashmint: { ...flashMintDefaults, enabled: true, maxAmount: '' },
    }),
  );
  t.is((error as OptionsError).messages.flashMintMaxAmount, 'Must be "max" or a non-negative number');
});

test('erc20 flash mint, invalid max amount', async t => {
  const error = t.throws(() =>
    buildERC20({
      name: 'MyToken',
      symbol: 'MTK',
      flashmint: { ...flashMintDefaults, enabled: true, maxAmount: 'abc' },
    }),
  );
  t.is((error as OptionsError).messages.flashMintMaxAmount, 'Must be "max" or a non-negative number');
});

test('erc20 flash mint, invalid percent fee', async t => {
  const error = t.throws(() =>
    buildERC20({
      name: 'MyToken',
      symbol: 'MTK',
      flashmint: { ...flashMintDefaults, enabled: true, feeMode: 'percent', feePercent: 'abc' },
    }),
  );
  t.is((error as OptionsError).messages.flashMintFeePercent, 'Must be a number between 0 and 100');
});

test('erc20 flash mint, percent fee out of range', async t => {
  const error = t.throws(() =>
    buildERC20({
      name: 'MyToken',
      symbol: 'MTK',
      flashmint: { ...flashMintDefaults, enabled: true, feeMode: 'percent', feePercent: '100.5' },
    }),
  );
  t.is((error as OptionsError).messages.flashMintFeePercent, 'Must be a number between 0 and 100');
});

test('erc20 flash mint, max amount overflows u256', async t => {
  const error = t.throws(() =>
    buildERC20({
      name: 'MyToken',
      symbol: 'MTK',
      decimals: '0',
      flashmint: {
        ...flashMintDefaults,
        enabled: true,
        // 2^256 — one past u256::MAX with decimals: '0' so getInitialSupply preserves the value.
        maxAmount: '115792089237316195423570985008687907853269984665640564039457584007913129639936',
      },
    }),
  );
  t.is((error as OptionsError).messages.flashMintMaxAmount, 'Value is greater than u256 max value');
});

test('erc20 flash mint, percent denominator overflows u256', async t => {
  const error = t.throws(() =>
    buildERC20({
      name: 'MyToken',
      symbol: 'MTK',
      flashmint: {
        ...flashMintDefaults,
        enabled: true,
        feeMode: 'percent',
        // 77 fractional digits — 100 * 10^77 > u256::MAX.
        feePercent: '0.' + '0'.repeat(76) + '1',
      },
    }),
  );
  t.is((error as OptionsError).messages.flashMintFeePercent, 'Value is greater than u256 max value');
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
