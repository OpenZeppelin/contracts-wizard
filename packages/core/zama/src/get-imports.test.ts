import test from 'ava';

import { getImports } from '@openzeppelin/wizard/src/get-imports';
import { buildConfidentialFungible } from './confidentialFungible';
import { generateSources } from './generate/sources';
import { buildGeneric } from './build-generic';

test('confidential fungible basic', t => {
  const c = buildConfidentialFungible({ name: 'MyToken', symbol: 'MTK', tokenURI: '', networkConfig: 'zama-sepolia' });
  const sources = getImports(c);
  const files = Object.keys(sources).sort();

  t.deepEqual(files, [
    '@openzeppelin/contracts/interfaces/draft-IERC6093.sol',
    '@openzeppelin/contracts/token/ConfidentialFungible/ConfidentialFungible.sol',
    '@openzeppelin/contracts/token/ConfidentialFungible/IConfidentialFungible.sol',
    '@openzeppelin/contracts/token/ConfidentialFungible/extensions/IConfidentialFungibleMetadata.sol',
    '@openzeppelin/contracts/utils/Context.sol',
  ]);
});

test('can get imports for all combinations', t => {
  for (const { options } of generateSources('all')) {
    const c = buildGeneric(options);
    getImports(c);
  }
  t.pass();
});
