import test from 'ava';
import type { OptionsError } from '.';
import { erc7984 } from '.';

import type { ERC7984Options } from './erc7984';
import { buildERC7984 } from './erc7984';
import { printContract } from './print';

function testERC7984(title: string, opts: Partial<ERC7984Options>) {
  test(title, t => {
    const c = buildERC7984({
      name: 'MyToken',
      symbol: 'MTK',
      contractURI: 'https://example.com/token',
      networkConfig: 'zama-sepolia',
      ...opts,
    });
    t.snapshot(printContract(c));
  });
}

/**
 * Tests external API for equivalence with internal API
 */
function testAPIEquivalence(title: string, opts?: ERC7984Options) {
  test(title, t => {
    t.is(
      erc7984.print(opts),
      printContract(
        buildERC7984({
          name: 'MyToken',
          symbol: 'MTK',
          contractURI: '',
          networkConfig: 'zama-sepolia',
          ...opts,
        }),
      ),
    );
  });
}

testERC7984('basic erc7984', {});

testERC7984('erc7984 name is unicodeSafe', { name: 'MyTokeć' });

testERC7984('erc7984 zama-ethereum', {
  networkConfig: 'zama-ethereum',
});

testERC7984('erc7984 preminted', {
  premint: '1000',
});

testERC7984('erc7984 premint of 0', {
  premint: '0',
});

function testPremint(scenario: string, premint: string, expectedError?: string) {
  test(`erc7984 premint - ${scenario} - ${expectedError ? 'invalid' : 'valid'}`, async t => {
    if (expectedError) {
      const error = t.throws(() =>
        buildERC7984({
          name: 'MyToken',
          symbol: 'MTK',
          contractURI: 'https://example.com/token',
          networkConfig: 'zama-sepolia',
          premint,
        }),
      );
      t.is((error as OptionsError).messages.premint, expectedError);
    } else {
      const c = buildERC7984({
        name: 'MyToken',
        symbol: 'MTK',
        contractURI: 'https://example.com/token',
        networkConfig: 'zama-sepolia',
        premint,
      });
      t.snapshot(printContract(c));
    }
  });
}

testPremint('max literal', '18446744073709.551615'); // 2^64 - 1, shifted by 6 decimals
testPremint('max literal + 1', '18446744073709.551616', 'Value is greater than uint64 max value');
testPremint('no arithmetic overflow', '18446744073709'); // 2^64 - 1, truncated by 6 decimals
testPremint(
  'arithmetic overflow',
  '18446744073710',
  'Amount would overflow uint64 after applying decimals, assuming 6 decimals',
);
testPremint('e notation', '1e13');
testPremint(
  'e notation arithmetic overflow',
  '1e14',
  'Amount would overflow uint64 after applying decimals, assuming 6 decimals',
);

testERC7984('erc7984 wrappable', {
  wrappable: true,
});

testERC7984('erc7984 votes + blocknumber', {
  votes: 'blocknumber',
});

testERC7984('erc7984 votes + timestamp', {
  votes: 'timestamp',
});

testERC7984('erc7984 full zama-sepolia', {
  premint: '2000',
  wrappable: true,
  votes: 'blocknumber',
  networkConfig: 'zama-sepolia',
});

testERC7984('erc7984 full zama-ethereum', {
  premint: '2000',
  wrappable: true,
  votes: 'blocknumber',
  networkConfig: 'zama-ethereum',
});

testERC7984('erc7984 full with timestamp votes', {
  premint: '2000',
  wrappable: true,
  votes: 'timestamp',
  networkConfig: 'zama-ethereum',
});

testAPIEquivalence('erc7984 API default');

testAPIEquivalence('erc7984 API basic', {
  name: 'CustomToken',
  symbol: 'CTK',
  contractURI: 'https://custom.example.com/token',
  networkConfig: 'zama-sepolia',
});

testAPIEquivalence('erc7984 API full', {
  name: 'CustomToken',
  symbol: 'CTK',
  contractURI: 'https://custom.example.com/token',
  networkConfig: 'zama-ethereum',
  premint: '2000',
  wrappable: true,
  votes: 'blocknumber',
});

test('erc7984 API assert defaults', async t => {
  t.is(erc7984.print(erc7984.defaults), erc7984.print());
});
