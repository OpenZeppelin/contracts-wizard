import test from 'ava';

import { getImports } from './get-imports';
import { buildERC20 } from './erc20';
import { buildERC721 } from './erc721';
import { generateSources } from './generate/sources';
import { buildGeneric } from './build-generic';

test('erc20 basic', t => {
  const c = buildERC20({ name: 'MyToken', symbol: 'MTK', permit: false });
  const sources: Record<string, string> = getImports(c);
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
  const c = buildERC721({ name: 'MyToken', symbol: 'MTK', mintable: true, incremental: true });
  const sources: Record<string, string> = getImports(c);
  const files = Object.keys(sources).sort();

  t.deepEqual(files, [
    '@openzeppelin/contracts/access/Ownable.sol',
    '@openzeppelin/contracts/interfaces/draft-IERC6093.sol',
    '@openzeppelin/contracts/token/ERC721/ERC721.sol',
    '@openzeppelin/contracts/token/ERC721/IERC721.sol',
    '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol',
    '@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol',
    '@openzeppelin/contracts/token/ERC721/utils/ERC721Utils.sol',
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
  const c = buildERC721({ name: 'MyToken', symbol: 'MTK', mintable: true, incremental: true, upgradeable: 'uups' });
  const sources: Record<string, string> = getImports(c);
  const files = Object.keys(sources).sort();

  t.deepEqual(files, [
    '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol',
    '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol',
    '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol',
    '@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol',
    '@openzeppelin/contracts-upgradeable/utils/ContextUpgradeable.sol',
    '@openzeppelin/contracts-upgradeable/utils/introspection/ERC165Upgradeable.sol',
    '@openzeppelin/contracts/interfaces/IERC1967.sol',
    '@openzeppelin/contracts/interfaces/draft-IERC1822.sol',
    '@openzeppelin/contracts/interfaces/draft-IERC6093.sol',
    '@openzeppelin/contracts/proxy/ERC1967/ERC1967Utils.sol',
    '@openzeppelin/contracts/proxy/beacon/IBeacon.sol',
    '@openzeppelin/contracts/token/ERC721/IERC721.sol',
    '@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol',
    '@openzeppelin/contracts/token/ERC721/extensions/IERC721Metadata.sol',
    '@openzeppelin/contracts/token/ERC721/utils/ERC721Utils.sol',
    '@openzeppelin/contracts/utils/Address.sol',
    '@openzeppelin/contracts/utils/Errors.sol',
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
    getImports(c);
  }
  t.pass();
});