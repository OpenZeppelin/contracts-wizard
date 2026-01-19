import { crossChainBridgingOptions, type ERC20Options } from '../erc20';
import { accessOptions } from '../set-access-control';
import { clockModeOptions } from '../set-clock-mode';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprintWithoutBasicFeatures = {
  name: ['MyToken'],
  symbol: ['MTK'],
  pausable: booleans,
  mintable: booleans,
  votes: [...booleans, ...clockModeOptions] as const,
  premint: ['1'],
  premintChainId: ['10'],
  crossChainBridging: crossChainBridgingOptions,
  crossChainLinkAllowOverride: [false],
  access: accessOptions,
  upgradeable: upgradeableOptions,
  namespacePrefix: ['myProject'],
  info: infoOptions,
};

// Basic features that do not depend on other features like access control
const basicFeatures = {
  OFF: {
    burnable: [false],
    callback: [false],
    permit: [false],
    flashmint: [false],
  },
  ON: {
    burnable: [true],
    callback: [true],
    permit: [true],
    flashmint: [true],
  },
};

export function* generateERC20Options(): Generator<Required<ERC20Options>> {
  // Separate generation steps with basic features OFF and ON to avoid having too many combinations
  for (const opts of generateAlternatives({ ...blueprintWithoutBasicFeatures, ...basicFeatures.OFF })) {
    // crossChainBridging does not currently support upgradeable
    if (!(opts.crossChainBridging && opts.upgradeable)) {
      yield opts;
    }
  }

  for (const opts of generateAlternatives({ ...blueprintWithoutBasicFeatures, ...basicFeatures.ON })) {
    // crossChainBridging does not currently support upgradeable
    if (!(opts.crossChainBridging && opts.upgradeable)) {
      yield opts;
    }
  }
}
