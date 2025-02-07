import test from 'ava';

import { buildERC20, ERC20Options, getInitialSupply } from './erc20';
import { printContract } from './print';

import { erc20, OptionsError } from '.';

function testERC20(title: string, opts: Partial<ERC20Options>) {
  test(title, t => {
    const c = buildERC20({
      name: 'MyToken',
      symbol: 'MTK',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: ERC20Options) {
  test(title, t => {
    t.is(erc20.print(opts), printContract(buildERC20({
      name: 'MyToken',
      symbol: 'MTK',
      ...opts,
    })));
  });
}

testERC20('basic erc20', {});

testERC20('erc20 burnable', {
  burnable: true,
});

testERC20('erc20 pausable', {
  pausable: true,
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

testERC20('erc20 mintable', {
  mintable: true,
});

testERC20('erc20 ownable', {
  access: 'ownable',
});

testERC20('erc20 full', {
  premint: '2000',
  access: 'ownable',
  burnable: true,
  mintable: true,
  pausable: true,
});

testERC20('erc20 full - complex name', {
  name: 'Custom  $ Token',
  premint: '2000',
  access: 'ownable',
  burnable: true,
  mintable: true,
  pausable: true,
});

testAPIEquivalence('erc20 API default');

testAPIEquivalence('erc20 API basic', { name: 'CustomToken', symbol: 'CTK' });

testAPIEquivalence('erc20 API full', {
  name: 'CustomToken',
  symbol: 'CTK',
  premint: '2000',
  burnable: true,
  mintable: true,
  pausable: true,
});

test('erc20 API assert defaults', async t => {
  t.is(erc20.print(erc20.defaults), erc20.print());
});

test('erc20 getInitialSupply', async t => {
  t.is(getInitialSupply('1000', 18),   '1000000000000000000000');
  t.is(getInitialSupply('1000.1', 18), '1000100000000000000000');
  t.is(getInitialSupply('.1', 18),     '100000000000000000');
  t.is(getInitialSupply('.01', 2), '1');

  let error = t.throws(() => getInitialSupply('.01', 1));
  t.not(error, undefined);
  t.is((error as OptionsError).messages.premint, 'Too many decimals');

  error = t.throws(() => getInitialSupply('1.1.1', 18));
  t.not(error, undefined);
  t.is((error as OptionsError).messages.premint, 'Not a valid number');
});