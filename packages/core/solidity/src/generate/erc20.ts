import { crossChainBridgingOptions, type ERC20Options } from '../erc20';
import { accessOptions } from '../set-access-control';
import { clockModeOptions } from '../set-clock-mode';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  burnable: booleans,
  pausable: booleans,
  mintable: booleans,
  permit: booleans,
  votes: [ ...booleans, ...clockModeOptions ] as const,
  flashmint: booleans,
  premint: ['1'],
  crossChainBridging: crossChainBridgingOptions,
  access: accessOptions,
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

export function* generateERC20Options(): Generator<Required<ERC20Options>> {
  for (const opts of generateAlternatives(blueprint)) {
    // crossChainBridging does not currently support upgradeable
    if (!(opts.crossChainBridging && opts.upgradeable)) {
      yield opts;
    }
  }
}
