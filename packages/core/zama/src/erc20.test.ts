import test from 'ava';
import type { OptionsError } from '.';
import { erc20 } from '.';

import type { ERC20Options } from './erc20';
import { buildERC20 } from './erc20';
import { printContract } from './print';

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
    t.is(
      erc20.print(opts),
      printContract(
        buildERC20({
          name: 'MyToken',
          symbol: 'MTK',
          ...opts,
        }),
      ),
    );
  });
}

testERC20('basic erc20', {});

testERC20('erc20 name is unicodeSafe', { name: 'MyTokeć' });

testERC20('erc20 preminted', {
  premint: '1000',
});

testERC20('erc20 premint of 0', {
  premint: '0',
});

function testPremint(scenario: string, premint: string, expectedError?: string) {
  test(`erc20 premint - ${scenario} - ${expectedError ? 'invalid' : 'valid'}`, async t => {
    if (expectedError) {
      const error = t.throws(() =>
        buildERC20({
          name: 'MyToken',
          symbol: 'MTK',
          premint,
        }),
      );
      t.is((error as OptionsError).messages.premint, expectedError);
    } else {
      const c = buildERC20({
        name: 'MyToken',
        symbol: 'MTK',
        premint,
      });
      t.snapshot(printContract(c));
    }
  });
}

testPremint('max literal', '115792089237316195423570985008687907853269984665640564039457.584007913129639935'); // 2^256 - 1, shifted by 18 decimals
testPremint(
  'max literal + 1',
  '115792089237316195423570985008687907853269984665640564039457.584007913129639936',
  'Value is greater than uint256 max value',
);
testPremint('no arithmetic overflow', '115792089237316195423570985008687907853269984665640564039457'); // 2^256 - 1, truncated by 18 decimals
testPremint(
  'arithmetic overflow',
  '115792089237316195423570985008687907853269984665640564039458',
  'Amount would overflow uint256 after applying decimals',
);
testPremint('e notation', '1e59');
testPremint('e notation arithmetic overflow', '1e60', 'Amount would overflow uint256 after applying decimals');

testERC20('erc20 mintable', {
  mintable: true,
  access: 'ownable',
});

testERC20('erc20 mintable with roles', {
  mintable: true,
  access: 'roles',
});

testERC20('erc20 votes', {
  votes: true,
});

testERC20('erc20 votes + blocknumber', {
  votes: 'blocknumber',
});

testERC20('erc20 votes + timestamp', {
  votes: 'timestamp',
});


// TODO test full
/**
testERC20('erc20 full', {
  premint: '2000',
  access: 'roles',
  burnable: true,
  mintable: true,
  pausable: true,
  callback: true,
  permit: true,
  votes: true,
  flashmint: true,
  upgradeable: 'uups',
});
*/


testAPIEquivalence('erc20 API default');

testAPIEquivalence('erc20 API basic', { name: 'CustomToken', symbol: 'CTK' });

testAPIEquivalence('erc20 API full upgradeable', {
  name: 'CustomToken',
  symbol: 'CTK',
  premint: '2000',
  access: 'roles',
  mintable: true,
  votes: true,
});

test('erc20 API assert defaults', async t => {
  t.is(erc20.print(erc20.defaults), erc20.print());
});
