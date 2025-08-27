import path from 'path';
import type { CommonOptions } from './common-options';

// If upgradeable is true-ish, translate a contract name or contract path into its corresponding upgradeable variant.
// Otherwise, return the input unmodified.
//
// Example:
// - makeUpgradeable('AccountERC7579', false) == 'AccountERC7579'
// - makeUpgradeable('AccountERC7579', 'uups') == 'AccountERC7579Upgradeable'
// - makeUpgradeable('@openzeppelin/contracts/account/extensions/draft-AccountERC7579.sol', false) == '@openzeppelin/contracts/account/extensions/draft-AccountERC7579.sol'
// - makeUpgradeable('@openzeppelin/contracts/account/extensions/draft-AccountERC7579.sol', 'uups') == '@openzeppelin/contracts-upgradeable/account/extensions/draft-AccountERC7579Upgradeable.sol'
export function makeUpgradeable(input: string, upgradeable: CommonOptions['upgradeable'] = false): string {
  switch (upgradeable) {
    case false:
      return input;
    case 'uups':
    case 'transparent': {
      const { dir, name, ext } = path.parse(input);
      return path.format({
        dir: dir.replace('/contracts/', '/contracts-upgradeable/'),
        name: name + 'Upgradeable',
        ext,
      });
    }
    default: {
      const _: never = upgradeable;
      throw new Error('Unknown upgradeable option');
    }
  }
}
