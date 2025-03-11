import type { ERC721Options } from '../erc721';
import { accessOptions } from '../set-access-control';
import { infoOptions } from '../set-info';
import { upgradeableOptions } from '../set-upgradeable';
import { royaltyInfoOptions } from '../set-royalty-info';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  baseUri: ['https://example.com/'],
  burnable: booleans,
  enumerable: booleans,
  votes: booleans,
  appName: ['MyApp'],
  appVersion: ['v1'],
  pausable: booleans,
  mintable: booleans,
  royaltyInfo: [royaltyInfoOptions.disabled, royaltyInfoOptions.enabledDefault, royaltyInfoOptions.enabledCustom],
  access: accessOptions,
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

export function* generateERC721Options(): Generator<Required<ERC721Options>> {
  yield* generateAlternatives(blueprint);
}
