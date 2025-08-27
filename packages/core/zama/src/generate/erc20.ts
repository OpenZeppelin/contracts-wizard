import { type ERC20Options } from '../erc20';
import { clockModeOptions } from '../set-clock-mode';
import { accessOptions } from '../set-access-control';
import { upgradeableOptions } from '../set-upgradeable';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  mintable: booleans,
  votes: [...booleans, ...clockModeOptions] as const,
  premint: ['1'],
  access: accessOptions,
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

export function* generateERC20Options(): Generator<Required<ERC20Options>> {
  yield* generateAlternatives(blueprint);
}
