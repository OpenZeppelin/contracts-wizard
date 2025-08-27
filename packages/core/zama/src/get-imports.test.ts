import test from 'ava';

import { getImports } from './get-imports';
import { buildERC20 } from './erc20';
import { generateSources } from './generate/sources';
import { buildGeneric } from './build-generic';

test('erc20 basic', t => {
  const c = buildERC20({ name: 'MyToken', symbol: 'MTK' });
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

test('can get imports for all combinations', t => {
  for (const { options } of generateSources('all')) {
    const c = buildGeneric(options);
    getImports(c);
  }
  t.pass();
});
