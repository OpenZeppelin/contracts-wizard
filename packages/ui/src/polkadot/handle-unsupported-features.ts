import type { GenericOptions, Kind } from '@openzeppelin/wizard';

export function defineOmitFeatures(): Map<Kind, string[]> {
  const omitFeatures: Map<Kind, string[]> = new Map();
  omitFeatures.set('ERC20', ['superchain']);
  omitFeatures.set('Stablecoin', ['superchain']);
  omitFeatures.set('RealWorldAsset', ['superchain']);
  return omitFeatures;
}

export function sanitizeOmittedFeatures(opts: GenericOptions) {
  if (opts.kind === 'ERC20' || opts.kind === 'Stablecoin' || opts.kind === 'RealWorldAsset') {
    if (opts.crossChainBridging === 'superchain') {
      opts.crossChainBridging = 'custom';
    }
  }
}
