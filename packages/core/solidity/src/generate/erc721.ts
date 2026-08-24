import type { ERC721Options } from '../erc721';
import { crossChainBridgingOptions } from '../erc721';
import { accessOptions } from '../set-access-control';
import { clockModeOptions } from '../set-clock-mode';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  baseUri: ['https://example.com/'],
  enumerable: booleans,
  uriStorage: booleans,
  burnable: booleans,
  pausable: booleans,
  mintable: booleans,
  incremental: booleans,
  crossChainBridging: crossChainBridgingOptions,
  crossChainLinkAllowOverride: [false],
  access: accessOptions,
  upgradeable: upgradeableOptions,
  namespacePrefix: ['myProject'],
  info: infoOptions,
  votes: [...booleans, ...clockModeOptions] as const,
};

// crossChainBridging x upgradeable is excluded from the exhaustive matrix above to limit its size,
// so cross it against a reduced blueprint to still get compile coverage of the transpiled variants.
const crossChainBridgingUpgradeableBlueprint = {
  ...blueprint,
  enumerable: [false],
  uriStorage: [false],
  burnable: [false],
  pausable: [false],
  mintable: [false],
  incremental: [false],
  votes: [false] as const,
  crossChainBridging: ['erc7786native'] as const,
  upgradeable: ['transparent', 'uups'] as const,
  info: [{}],
};

export function* generateERC721Options(): Generator<Required<ERC721Options>> {
  for (const opts of generateAlternatives(blueprint)) {
    // crossChainBridging x upgradeable is covered by the reduced blueprint below
    if (!(opts.crossChainBridging && opts.upgradeable)) {
      yield opts;
    }
  }

  yield* generateAlternatives(crossChainBridgingUpgradeableBlueprint);
}
