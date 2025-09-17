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
      tokenURI: 'https://example.com/token',
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

testConfidentialFungible('basic confidential fungible', {});

testConfidentialFungible('confidential fungible name is unicodeSafe', { name: 'MyTokeć' });

testConfidentialFungible('confidential fungible with custom tokenURI', {
  tokenURI: 'https://custom.example.com/metadata',
});

testConfidentialFungible('confidential fungible zama-ethereum network', {
  networkConfig: 'zama-ethereum',
});

testConfidentialFungible('confidential fungible preminted', {
  premint: '1000',
});

testConfidentialFungible('confidential fungible premint of 0', {
  premint: '0',
});

function testPremint(scenario: string, premint: string, expectedError?: string) {
  test(`confidential fungible premint - ${scenario} - ${expectedError ? 'invalid' : 'valid'}`, async t => {
    if (expectedError) {
      const error = t.throws(() =>
        buildConfidentialFungible({
          name: 'MyToken',
          symbol: 'MTK',
          tokenURI: 'https://example.com/token',
          networkConfig: 'zama-sepolia',
          premint,
        }),
      );
      t.is((error as OptionsError).messages.premint, expectedError);
    } else {
      const c = buildConfidentialFungible({
        name: 'MyToken',
        symbol: 'MTK',
        tokenURI: 'https://example.com/token',
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

testConfidentialFungible('confidential fungible wrappable', {
  wrappable: true,
});

testConfidentialFungible('confidential fungible votes', {
  votes: true,
});

testConfidentialFungible('confidential fungible votes + blocknumber', {
  votes: 'blocknumber',
});

testConfidentialFungible('confidential fungible votes + timestamp', {
  votes: 'timestamp',
});

testConfidentialFungible('confidential fungible full features zama-sepolia', {
  premint: '2000',
  wrappable: true,
  votes: true,
  networkConfig: 'zama-sepolia',
});

testConfidentialFungible('confidential fungible full features zama-ethereum', {
  premint: '2000',
  wrappable: true,
  votes: true,
  networkConfig: 'zama-ethereum',
});

testConfidentialFungible('confidential fungible full features with timestamp votes', {
  premint: '2000',
  wrappable: true,
  votes: 'timestamp',
  networkConfig: 'zama-ethereum',
});

testAPIEquivalence('confidential fungible API default');

testAPIEquivalence('confidential fungible API basic', { 
  name: 'CustomToken', 
  symbol: 'CTK',
  tokenURI: 'https://custom.example.com/token',
  networkConfig: 'zama-sepolia',
});

testAPIEquivalence('confidential fungible API full features', {
  name: 'CustomToken',
  symbol: 'CTK',
  tokenURI: 'https://custom.example.com/token',
  networkConfig: 'zama-ethereum',
  premint: '2000',
  wrappable: true,
  votes: true,
});

test('confidential fungible API assert defaults', async t => {
  t.is(confidentialFungible.print(confidentialFungible.defaults), confidentialFungible.print());
});
