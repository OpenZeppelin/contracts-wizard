import { DEFAULT_DECIMALS, type ERC7984Options } from '../erc7984';
import { clockModeOptions, infoOptions, generateAlternatives } from '@openzeppelin/wizard';

const booleans = [true, false];

const blueprint = {
  name: ['MyToken'],
  symbol: ['MTK'],
  contractURI: ['http://example.com'],
  decimals: ['6', '18'],
  votes: [false, ...clockModeOptions] as const,
  premint: ['0', '1'],
  info: infoOptions,
  networkConfig: ['zama-ethereum'] as const,
  wrappable: booleans,
};

export function* generateERC7984Options(): Generator<Required<ERC7984Options>> {
  for (const opts of generateAlternatives(blueprint)) {
    // Custom decimals is incompatible with wrappable (which uses the underlying token's decimals),
    // and preminted tokens would not be backed by the underlying token of the wrappable extension
    if (opts.wrappable && (opts.decimals !== DEFAULT_DECIMALS.toString() || opts.premint !== '0')) {
      continue;
    }
    yield opts;
  }
}
