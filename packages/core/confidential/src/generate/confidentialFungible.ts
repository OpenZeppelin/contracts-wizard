import { type ConfidentialFungibleOptions } from '../confidentialFungible';
import { clockModeOptions } from '@openzeppelin/wizard/src/set-clock-mode';
import { infoOptions } from '@openzeppelin/wizard/src/set-info';
import { generateAlternatives } from '@openzeppelin/wizard/src/generate/alternatives';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  tokenURI: ['http://example.com'],
  votes: [...booleans, ...clockModeOptions] as const,
  premint: ['1'],
  info: infoOptions,
  networkConfig: ['zama-sepolia', 'zama-ethereum'] as const,
  wrappable: booleans,
};

export function* generateConfidentialFungibleOptions(): Generator<Required<ConfidentialFungibleOptions>> {
  yield* generateAlternatives(blueprint);
}
