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

testERC20('erc20 burnable', {
  burnable: true,
});

testERC20('erc20 pausable', {
  pausable: true,
  access: 'ownable',
});

testERC20('erc20 pausable with roles', {
  pausable: true,
  access: 'roles',
});

testERC20('erc20 pausable with managed', {
  pausable: true,
  access: 'managed',
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

testERC20('erc20 callback', {
  callback: true,
});

testERC20('erc20 permit', {
  permit: true,
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

testERC20('erc20 flashmint', {
  flashmint: true,
});

testERC20('erc20 crossChainBridging custom', {
  crossChainBridging: 'custom',
});

testERC20('erc20 crossChainBridging custom ownable', {
  crossChainBridging: 'custom',
  access: 'ownable',
});

testERC20('erc20 crossChainBridging custom ownable mintable burnable', {
  crossChainBridging: 'custom',
  access: 'ownable',
  mintable: true,
  burnable: true,
});

testERC20('erc20 crossChainBridging custom roles', {
  crossChainBridging: 'custom',
  access: 'roles',
});

testERC20('erc20 crossChainBridging custom managed', {
  crossChainBridging: 'custom',
  access: 'managed',
});

testERC20('erc20 crossChainBridging superchain', {
  crossChainBridging: 'superchain',
});

testERC20('erc20 crossChainBridging superchain ownable', {
  crossChainBridging: 'superchain',
  access: 'ownable',
});

testERC20('erc20 crossChainBridging superchain roles', {
  crossChainBridging: 'superchain',
  access: 'roles',
});

testERC20('erc20 crossChainBridging superchain managed', {
  crossChainBridging: 'superchain',
  access: 'managed',
});

test('erc20 crossChainBridging custom, upgradeable not allowed', async t => {
  const error = t.throws(() =>
    buildERC20({
      name: 'MyToken',
      symbol: 'MTK',
      crossChainBridging: 'custom',
      upgradeable: 'transparent',
    }),
  );
  t.is(
    (error as OptionsError).messages.crossChainBridging,
    'Upgradeability is not currently supported with Cross-Chain Bridging',
  );
});

test('erc20 crossChainBridging superchain, upgradeable not allowed', async t => {
  const error = t.throws(() =>
    buildERC20({
      name: 'MyToken',
      symbol: 'MTK',
      crossChainBridging: 'superchain',
      upgradeable: 'transparent',
    }),
  );
  t.is(
    (error as OptionsError).messages.crossChainBridging,
    'Upgradeability is not currently supported with Cross-Chain Bridging',
  );
});

test('erc20 crossChainBridging superchain, premintChainId required', async t => {
  const error = t.throws(() =>
    buildERC20({
      name: 'MyToken',
      symbol: 'MTK',
      crossChainBridging: 'superchain',
      premint: '2000',
    }),
  );
  t.is(
    (error as OptionsError).messages.premintChainId,
    'Chain ID is required when using Premint with Cross-Chain Bridging',
  );
});

testERC20('erc20 premint ignores chainId when not crossChainBridging', {
  premint: '2000',
  premintChainId: '10',
});

testERC20('erc20 premint chainId crossChainBridging custom', {
  premint: '2000',
  premintChainId: '10',
  crossChainBridging: 'custom',
});

testERC20('erc20 premint chainId crossChainBridging superchain', {
  premint: '2000',
  premintChainId: '10',
  crossChainBridging: 'superchain',
});

testERC20('erc20 full crossChainBridging custom non-upgradeable', {
  premint: '2000',
  access: 'roles',
  burnable: true,
  mintable: true,
  pausable: true,
  callback: true,
  permit: true,
  votes: true,
  flashmint: true,
  crossChainBridging: 'custom',
  premintChainId: '10',
});

testERC20('erc20 full upgradeable transparent', {
  premint: '2000',
  access: 'roles',
  burnable: true,
  mintable: true,
  pausable: true,
  callback: true,
  permit: true,
  votes: true,
  flashmint: true,
  upgradeable: 'transparent',
});

testERC20('erc20 full upgradeable uups', {
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

testERC20('erc20 full upgradeable uups managed', {
  premint: '2000',
  access: 'managed',
  burnable: true,
  mintable: true,
  pausable: true,
  callback: true,
  permit: true,
  votes: true,
  flashmint: true,
  upgradeable: 'uups',
});

testAPIEquivalence('erc20 API default');

testAPIEquivalence('erc20 API basic', { name: 'CustomToken', symbol: 'CTK' });

testAPIEquivalence('erc20 API full upgradeable', {
  name: 'CustomToken',
  symbol: 'CTK',
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

test('erc20 API assert defaults', async t => {
  t.is(erc20.print(erc20.defaults), erc20.print());
});

test('erc20 API isAccessControlRequired', async t => {
  t.is(erc20.isAccessControlRequired({ mintable: true }), true);
  t.is(erc20.isAccessControlRequired({ pausable: true }), true);
  t.is(erc20.isAccessControlRequired({ upgradeable: 'uups' }), true);
  t.is(erc20.isAccessControlRequired({ upgradeable: 'transparent' }), false);
});
