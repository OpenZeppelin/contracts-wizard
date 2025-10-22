import { type ConfidentialFungibleOptions } from '../confidentialFungible';
import { clockModeOptions, infoOptions, generateAlternatives } from '@openzeppelin/wizard';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  tokenURI: ['http://example.com'],
  votes: [false, ...clockModeOptions] as const,
  premint: ['1'],
  info: infoOptions,
  networkConfig: ['zama-sepolia', 'zama-ethereum'] as const,
  wrappable: booleans,
};

export function* generateConfidentialFungibleOptions(): Generator<Required<ConfidentialFungibleOptions>> {
  yield* generateAlternatives(blueprint);
}
