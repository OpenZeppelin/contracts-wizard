import { OptionsError } from '@openzeppelin/wizard';
import type { GenericOptions, Kind } from '@openzeppelin/wizard';

export function defineOmitFeatures(): Map<Kind, string[]> {
  const omitFeatures: Map<Kind, string[]> = new Map();
  omitFeatures.set('ERC20', ['superchain', 'ccip', 'chainlinkAce']);
  omitFeatures.set('Stablecoin', ['superchain', 'ccip', 'chainlinkAce']);
  omitFeatures.set('RealWorldAsset', ['superchain', 'ccip', 'chainlinkAce']);
  return omitFeatures;
}

export function sanitizeOmittedFeatures(opts: GenericOptions) {
  if (opts.kind === 'ERC20' || opts.kind === 'Stablecoin' || opts.kind === 'RealWorldAsset') {
    if (opts.crossChainBridging === 'chainlink-ccip' || opts.chainlinkAce) {
      throw new OptionsError({
        ...(opts.crossChainBridging === 'chainlink-ccip' && {
          crossChainBridging: 'Chainlink CCIP is not supported by the Polkadot Wizard.',
        }),
        ...(opts.chainlinkAce && { chainlinkAce: 'Chainlink ACE is not supported by the Polkadot Wizard.' }),
      });
    }
    if (opts.crossChainBridging === 'superchain') {
      opts.crossChainBridging = 'custom';
    }
  }
}
