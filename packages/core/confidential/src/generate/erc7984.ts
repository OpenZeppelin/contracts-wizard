import { type ERC7984Options } from '../erc7984';
import { clockModeOptions, infoOptions, generateAlternatives } from '@openzeppelin/wizard';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  contractURI: ['http://example.com'],
  votes: [false, ...clockModeOptions] as const,
  premint: ['0', '1'],
  info: infoOptions,
  networkConfig: ['zama-ethereum'] as const,
  wrappable: booleans,
};

export function* generateERC7984Options(): Generator<Required<ERC7984Options>> {
  for (const opts of generateAlternatives(blueprint)) {
    // Preminted tokens would not be backed by the underlying token of the wrappable extension
    if (opts.wrappable && opts.premint !== '0') {
      continue;
    }
    yield opts;
  }
}
