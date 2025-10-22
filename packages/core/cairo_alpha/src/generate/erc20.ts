import type { ERC20Options } from '../erc20';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';
import { resolveMacrosOptions } from '../set-macros';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  decimals: ['6', '18'],
  burnable: booleans,
  pausable: booleans,
  mintable: booleans,
  premint: ['1'],
  votes: booleans,
  appName: ['MyApp'],
  appVersion: ['v1'],
  access: accessOptions,
  upgradeable: upgradeableOptions,
  info: infoOptions,
  macros: resolveMacrosOptions('all'),
};

export function* generateERC20Options(): Generator<Required<ERC20Options>> {
  yield* generateAlternatives(blueprint);
}
