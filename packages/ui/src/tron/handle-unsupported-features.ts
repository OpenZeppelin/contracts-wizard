import type { GenericOptions, Kind } from '@openzeppelin/wizard';

/**
 * Features that don't apply on TRON.
 *
 * `superchain` cross-chain bridging is OP Stack-specific (not relevant for TRON).
 * Upgradeable contracts: `@openzeppelin/tron-contracts` doesn't yet ship the
 * transpiled `*Upgradeable` variants, so the upgradeable downloads are hidden
 * via `omitZipHardhat`/`omitZipFoundry` in tron/App.svelte rather than being
 * removed from the UI form.
 */
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
