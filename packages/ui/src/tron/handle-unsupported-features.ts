import type { GenericOptions, Kind } from '@openzeppelin/wizard';
import { sanitizeTronOptions } from '@openzeppelin/wizard';

/**
 * Features that don't apply on TRON.
 *
 * `superchain` cross-chain bridging is OP Stack-specific (not relevant for TRON).
 */
export function defineOmitFeatures(): Map<Kind, string[]> {
  const omitFeatures: Map<Kind, string[]> = new Map();
  omitFeatures.set('ERC20', ['superchain']);
  omitFeatures.set('Stablecoin', ['superchain']);
  omitFeatures.set('RealWorldAsset', ['superchain']);
  return omitFeatures;
}

// Shared with the CLI and MCP TRON surfaces via `@openzeppelin/wizard` so all
// three gate `superchain` the same way. Only ERC20/Stablecoin/RWA carry a
// `crossChainBridging` field, so the kind guard both narrows the type for
// `sanitizeTronOptions` and skips the no-op kinds.
export function sanitizeOmittedFeatures(opts: GenericOptions) {
  if (opts.kind === 'ERC20' || opts.kind === 'Stablecoin' || opts.kind === 'RealWorldAsset') {
    sanitizeTronOptions(opts);
  }
}
