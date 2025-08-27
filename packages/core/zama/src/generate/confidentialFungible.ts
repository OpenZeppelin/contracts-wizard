import { type ConfidentialFungibleOptions } from '../confidentialFungible';
import { clockModeOptions } from '../set-clock-mode';
import { accessOptions } from '../set-access-control';
import { upgradeableOptions } from '../set-upgradeable';
import { infoOptions } from '../set-info';
import { generateAlternatives } from './alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  tokenURI: ['http://example.com'],
  mintable: booleans,
  votes: [...booleans, ...clockModeOptions] as const,
  premint: ['1'],
  access: accessOptions,
  upgradeable: upgradeableOptions,
  info: infoOptions,
};

export function* generateConfidentialFungibleOptions(): Generator<Required<ConfidentialFungibleOptions>> {
  yield* generateAlternatives(blueprint);
}
