import test from 'ava';

import { getImports } from './get-imports';
import { buildERC20 } from './erc20';
import { buildERC721 } from './erc721';
import { generateSources } from './generate/sources';
import { buildGeneric } from './build-generic';

test('erc20 basic', t => {
  const c = buildERC20({ name: 'MyToken', symbol: 'MTK', permit: false });
  const sources = getImports(c);
  const files = Object.keys(sources).sort();

  t.deepEqual(files, [
    '@openzeppelin/contracts/interfaces/draft-IERC6093.sol',
    '@openzeppelin/contracts/token/ERC20/ERC20.sol',
    '@openzeppelin/contracts/token/ERC20/IERC20.sol',
    '@openzeppelin/contracts/token/ERC20/extensions/IERC20Metadata.sol',
    '@openzeppelin/contracts/utils/Context.sol',
  ]);
});

test('erc721 auto increment', t => {
  const c = buildERC721({
    name: 'MyToken',
    symbol: 'MTK',
    mintable: true,
    incremental: true,
  });
  const sources = getImports(c);
  const files = Object.keys(sources).sort();

  t.deepEqual(files, [
    '@openzeppelin/contracts/access/Ownable.sol',
    '@openzeppelin/contracts/interfaces/draft-IERC6093.sol',
    '@openzeppelin/contracts/token/ERC721/ERC721.sol',
    '@openzeppelin/contracts/token/ERC721/IERC721.sol',
    '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol',
    '@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol',
    '@openzeppelin/contracts/token/ERC721/utils/ERC721Utils.sol',
    '@openzeppelin/contracts/utils/Bytes.sol',
    '@openzeppelin/contracts/utils/Context.sol',
    '@openzeppelin/contracts/utils/Panic.sol',
    '@openzeppelin/contracts/utils/Strings.sol',
    '@openzeppelin/contracts/utils/introspection/ERC165.sol',
    '@openzeppelin/contracts/utils/introspection/IERC165.sol',
    '@openzeppelin/contracts/utils/math/Math.sol',
    '@openzeppelin/contracts/utils/math/SafeCast.sol',
    '@openzeppelin/contracts/utils/math/SignedMath.sol',
  ]);
});

test('erc721 auto increment uups', t => {
  const c = buildERC721({
    name: 'MyToken',
    symbol: 'MTK',
    mintable: true,
    incremental: true,
    upgradeable: 'uups',
  });
  const sources = getImports(c);
  const files = Object.keys(sources).sort();

  t.deepEqual(files, [
    '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol',
    '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol',
    '@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol',
    '@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol',
    '@openzeppelin/contracts/interfaces/IERC1967.sol',
    '@openzeppelin/contracts/interfaces/draft-IERC1822.sol',
    '@openzeppelin/contracts/interfaces/draft-IERC6093.sol',
    '@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol',
    '@openzeppelin/contracts/proxy/beacon/IBeacon.sol',
    '@openzeppelin/contracts/proxy/utils/Initializable.sol',
    '@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol',
    '@openzeppelin/contracts/token/ERC721/IERC721.sol',
    '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol',
    '@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol',
    '@openzeppelin/contracts/token/ERC721/utils/ERC721Utils.sol',
    '@openzeppelin/contracts/utils/Address.sol',
    '@openzeppelin/contracts/utils/Bytes.sol',
    '@openzeppelin/contracts/utils/Errors.sol',
    '@openzeppelin/contracts/utils/LowLevelCall.sol',
    '@openzeppelin/contracts/utils/Panic.sol',
    '@openzeppelin/contracts/utils/StorageSlot.sol',
    '@openzeppelin/contracts/utils/Strings.sol',
    '@openzeppelin/contracts/utils/introspection/IERC165.sol',
    '@openzeppelin/contracts/utils/math/Math.sol',
    '@openzeppelin/contracts/utils/math/SafeCast.sol',
    '@openzeppelin/contracts/utils/math/SignedMath.sol',
  ]);
});

test('can get imports for all combinations', t => {
  for (const { options } of generateSources('all')) {
    const c = buildGeneric(options);
    // ACE's Solidity is not bundled; projects install it from npm instead.
    if ('chainlinkAce' in options && options.chainlinkAce) {
      t.throws(() => getImports(c), { message: /Source for @chainlink\/ace\/.* not found/ });
    } else {
      getImports(c);
    }
  }
  t.pass();
});

// Use the baseline ContractBuilder API to test packaging independently of feature generation.
import { ContractBuilder } from './contract';
import { getVersionedRemappings } from './get-versioned-remappings';

test('ACE remappings use the ACE package version independently of OpenZeppelin', t => {
  t.true(getVersionedRemappings({ chainlinkAce: true }).includes('@chainlink/ace/=@chainlink/ace@1.2.0/'));
  t.false(getVersionedRemappings({ chainlinkAce: true }).some(p => /@chainlink\/ace@5\./.test(p)));
});

import bundledContracts from '../openzeppelin-contracts';

test('ACE packaging preserves full license and additional grants in the source bundle', t => {
  t.regex(bundledContracts.sources['@chainlink/ace/LICENSE'] ?? '', /Business Source License/);
  t.truthy(bundledContracts.sources['@chainlink/ace/chainlink-ace-License-grants']);
});

test('ACE Solidity sources are not bundled; only its legal texts are', t => {
  const aceSources = Object.keys(bundledContracts.sources).filter(p => p.startsWith('@chainlink/ace/'));
  t.deepEqual(aceSources.sort(), ['@chainlink/ace/LICENSE', '@chainlink/ace/chainlink-ace-License-grants']);
  const c = new ContractBuilder('ACEPackaging');
  c.addImportOnly({
    name: 'PolicyProtectedBase',
    path: '@chainlink/ace/packages/policy-management/src/core/PolicyProtectedBase.sol',
    transpiled: false,
  });
  t.throws(() => getImports(c), { message: /Source for .*PolicyProtectedBase\.sol not found/ });
});
