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
  chainlinkAce: [false] as const,
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
  // CCIP requires Mintable; keep the shared row valid for every bridge mode.
  mintable: [true],
  votes: [false] as const,
  crossChainBridging: ['custom', 'erc7786native', 'superchain', 'chainlink-ccip'] as const,
  upgradeable: ['transparent', 'uups'] as const,
  info: [{}],
};

// ACE cannot cover callback/flashloan/other bridge selectors or constructor premint.
// Keep a bounded, valid matrix separate from those unsupported combinations.
export const aceBlueprint = {
  ...blueprintWithoutBasicFeatures,
  ...basicFeatures.OFF,
  chainlinkAce: [true] as const,
  premint: ['0'],
  access: ['ownable', 'roles'] as const,
  crossChainBridging: [false, 'chainlink-ccip'] as const,
  votes: [false, 'timestamp'] as const,
  burnable: booleans,
  info: [{}],
};

export function* generateERC20Options(): Generator<Required<ERC20Options>> {
  for (const opts of generateAlternatives(aceBlueprint)) {
    if (opts.crossChainBridging === 'chainlink-ccip' && (opts.access !== 'roles' || !opts.mintable)) continue;
    yield opts;
  }

  // Separate generation steps with basic features OFF and ON to avoid having too many combinations
  for (const opts of generateAlternatives({ ...blueprintWithoutBasicFeatures, ...basicFeatures.OFF })) {
    if (opts.crossChainBridging === 'chainlink-ccip' && (opts.access !== 'roles' || !opts.mintable)) continue;
    // crossChainBridging x upgradeable is covered by the reduced blueprint below
    if (!(opts.crossChainBridging && opts.upgradeable)) {
      yield opts;
    }
  }

  for (const opts of generateAlternatives({ ...blueprintWithoutBasicFeatures, ...basicFeatures.ON })) {
    if (opts.crossChainBridging === 'chainlink-ccip' && (opts.access !== 'roles' || !opts.mintable)) continue;
    // crossChainBridging x upgradeable is covered by the reduced blueprint below
    if (!(opts.crossChainBridging && opts.upgradeable)) {
      yield opts;
    }
  }

  for (const opts of generateAlternatives(crossChainBridgingUpgradeableBlueprint)) {
    if (opts.crossChainBridging === 'chainlink-ccip' && (opts.access !== 'roles' || !opts.mintable)) continue;
    yield opts;
  }
}
