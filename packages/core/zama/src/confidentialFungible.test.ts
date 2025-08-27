import test from 'ava';
import type { OptionsError } from '.';
import { confidentialFungible } from '.';

import type { ConfidentialFungibleOptions } from './confidentialFungible';
import { buildConfidentialFungible } from './confidentialFungible';
import { printContract } from './print';

function testConfidentialFungible(title: string, opts: Partial<ConfidentialFungibleOptions>) {
  test(title, t => {
    const c = buildConfidentialFungible({
      name: 'MyToken',
      symbol: 'MTK',
      tokenURI: '',
      networkConfig: 'zama-sepolia',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: ConfidentialFungibleOptions) {
  test(title, t => {
    t.is(
      confidentialFungible.print(opts),
      printContract(
        buildConfidentialFungible({
          name: 'MyToken',
          symbol: 'MTK',
          tokenURI: '',
          networkConfig: 'zama-sepolia',
          ...opts,
        }),
      ),
    );
  });
}

testConfidentialFungible('basic confidentialFungible', {});

testConfidentialFungible('confidentialFungible name is unicodeSafe', { name: 'MyTokeć' });

testConfidentialFungible('confidentialFungible preminted', {
  premint: '1000',
});

testConfidentialFungible('confidentialFungible premint of 0', {
  premint: '0',
});

function testPremint(scenario: string, premint: string, expectedError?: string) {
  test(`confidentialFungible premint - ${scenario} - ${expectedError ? 'invalid' : 'valid'}`, async t => {
    if (expectedError) {
      const error = t.throws(() =>
        buildConfidentialFungible({
          name: 'MyToken',
          symbol: 'MTK',
          tokenURI: '',
          networkConfig: 'zama-sepolia',
          premint,
        }),
      );
      t.is((error as OptionsError).messages.premint, expectedError);
    } else {
      const c = buildConfidentialFungible({
        name: 'MyToken',
        symbol: 'MTK',
        tokenURI: '',
        networkConfig: 'zama-sepolia',
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

testConfidentialFungible('confidentialFungible wrappable', {
  wrappable: true,
  access: 'ownable',
});

testConfidentialFungible('confidentialFungible wrappable with roles', {
  wrappable: true,
  access: 'roles',
});

testConfidentialFungible('confidentialFungible votes', {
  votes: true,
});

testConfidentialFungible('confidentialFungible votes + blocknumber', {
  votes: 'blocknumber',
});

testConfidentialFungible('confidentialFungible votes + timestamp', {
  votes: 'timestamp',
});


// TODO test full
/**
testConfidentialFungible('confidentialFungible full', {
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


testAPIEquivalence('confidentialFungible API default');

testAPIEquivalence('confidentialFungible API basic', { name: 'CustomToken', symbol: 'CTK', tokenURI: '' });

testAPIEquivalence('confidentialFungible API full upgradeable', {
  name: 'CustomToken',
  symbol: 'CTK',
  tokenURI: 'http://example.com',
  networkConfig: 'zama-ethereum',
  premint: '2000',
  access: 'roles',
  wrappable: true,
  votes: true,
});

test('confidentialFungible API assert defaults', async t => {
  t.is(confidentialFungible.print(confidentialFungible.defaults), confidentialFungible.print());
});
