import type { ERC1155Options } from '../erc1155';
import { crossChainBridgingOptions } from '../erc1155';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  uri: ['https://example.com/'],
  burnable: booleans,
  pausable: booleans,
  mintable: booleans,
  supply: booleans,
  updatableUri: booleans,
  crossChainBridging: crossChainBridgingOptions,
  crossChainLinkAllowOverride: [false],
  access: accessOptions,
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

// crossChainBridging x upgradeable is excluded from the exhaustive matrix above to limit its size,
// so cross it against a reduced blueprint to still get compile coverage of the transpiled variants.
const crossChainBridgingUpgradeableBlueprint = {
  ...blueprint,
  burnable: [false],
  pausable: [false],
  mintable: [false],
  supply: [false],
  updatableUri: [false],
  crossChainBridging: ['erc7786native'] as const,
  upgradeable: ['transparent', 'uups'] as const,
  info: [{}],
};

export function* generateERC1155Options(): Generator<Required<ERC1155Options>> {
  for (const opts of generateAlternatives(blueprint)) {
    // crossChainBridging x upgradeable is covered by the reduced blueprint below
    if (!(opts.crossChainBridging && opts.upgradeable)) {
      yield opts;
    }
  }

  yield* generateAlternatives(crossChainBridgingUpgradeableBlueprint);
}
