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

testConfidentialFungible('basic confidentialFungible', {});

testConfidentialFungible('confidentialFungible name is unicodeSafe', { name: 'MyTokeć' });

testConfidentialFungible('confidentialFungible zama-ethereum', {
  networkConfig: 'zama-ethereum',
});

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

testPremint('max literal', '18446744073709.551615'); // 2^64 - 1, shifted by 6 decimals
testPremint(
  'max literal + 1',
  '18446744073709.551616',
  'Value is greater than uint64 max value',
);
testPremint('no arithmetic overflow', '18446744073709'); // 2^64 - 1, truncated by 6 decimals
testPremint(
  'arithmetic overflow',
  '18446744073710',
  'Amount would overflow uint64 after applying decimals, assuming 6 decimals',
);
testPremint('e notation', '1e13');
testPremint('e notation arithmetic overflow', '1e14', 'Amount would overflow uint64 after applying decimals, assuming 6 decimals');

testConfidentialFungible('confidentialFungible wrappable', {
  wrappable: true,
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

testConfidentialFungible('confidentialFungible full zama-sepolia', {
  premint: '2000',
  wrappable: true,
  votes: true,
  networkConfig: 'zama-sepolia',
});

testConfidentialFungible('confidentialFungible full zama-ethereum', {
  premint: '2000',
  wrappable: true,
  votes: true,
  networkConfig: 'zama-ethereum',
});

testConfidentialFungible('confidentialFungible full with timestamp votes', {
  premint: '2000',
  wrappable: true,
  votes: 'timestamp',
  networkConfig: 'zama-ethereum',
});

testAPIEquivalence('confidentialFungible API default');

testAPIEquivalence('confidentialFungible API basic', {
  name: 'CustomToken',
  symbol: 'CTK',
  tokenURI: 'https://custom.example.com/token',
  networkConfig: 'zama-sepolia',
});

testAPIEquivalence('confidentialFungible API full', {
  name: 'CustomToken',
  symbol: 'CTK',
  tokenURI: 'https://custom.example.com/token',
  networkConfig: 'zama-ethereum',
  premint: '2000',
  wrappable: true,
  votes: true,
});

test('confidentialFungible API assert defaults', async t => {
  t.is(confidentialFungible.print(confidentialFungible.defaults), confidentialFungible.print());
});
