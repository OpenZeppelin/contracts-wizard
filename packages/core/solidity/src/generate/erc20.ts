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
  decimals: ['6', '18'],
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

// crossChainBridging x upgradeable is excluded from the exhaustive matrix above to limit its size,
// so cross it against a reduced blueprint to still get compile coverage of the transpiled variants
// (including the ERC-7201 namespaced storage used by 'custom' bridging when upgradeable).
const crossChainBridgingUpgradeableBlueprint = {
  ...blueprintWithoutBasicFeatures,
  ...basicFeatures.OFF,
  decimals: ['18'],
  pausable: [false],
  mintable: [false],
  votes: [false] as const,
  crossChainBridging: ['custom', 'erc7786native', 'superchain'] as const,
  upgradeable: ['transparent', 'uups'] as const,
  info: [{}],
};

export function* generateERC20Options(): Generator<Required<ERC20Options>> {
  // Separate generation steps with basic features OFF and ON to avoid having too many combinations
  for (const opts of generateAlternatives({ ...blueprintWithoutBasicFeatures, ...basicFeatures.OFF })) {
    // crossChainBridging x upgradeable is covered by the reduced blueprint below
    if (!(opts.crossChainBridging && opts.upgradeable)) {
      yield opts;
    }
  }

  for (const opts of generateAlternatives({ ...blueprintWithoutBasicFeatures, ...basicFeatures.ON })) {
    // crossChainBridging x upgradeable is covered by the reduced blueprint below
    if (!(opts.crossChainBridging && opts.upgradeable)) {
      yield opts;
    }
  }

  yield* generateAlternatives(crossChainBridgingUpgradeableBlueprint);
}
