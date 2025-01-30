import type { ERC20Options } from '../erc20';
import { accessOptions } from '../set-access-control';
import { clockModeOptions } from '../set-clock-mode';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

export const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  burnable: booleans,
  pausable: booleans,
  mintable: booleans,
  permit: booleans,
  votes: [ ...booleans, ...clockModeOptions ] as const,
  flashmint: booleans,
  premint: ['1'],
  bridgeable: [ ...booleans, 'superchain' ] as const,
  access: accessOptions,
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

export function* generateERC20Options(): Generator<Required<ERC20Options>> {
  for (const opts of generateAlternatives(blueprint)) {
    // Only yield options that are not both bridgeable and upgradeable, since ERC20Bridgeable does not currently support usage with upgradeable contracts.
    if (!(opts.bridgeable && opts.upgradeable)) {
      yield opts;
    }
  }
}
