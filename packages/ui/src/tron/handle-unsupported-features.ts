import type { GenericOptions, Kind } from '@openzeppelin/wizard';
import { sanitizeTronOptions } from '@openzeppelin/wizard';

/**
 * Features that don't apply on TRON.
 *
 * `superchain` cross-chain bridging is OP Stack-specific (not relevant for TRON).
 */
export function defineOmitFeatures(): Map<Kind, string[]> {
  const omitFeatures: Map<Kind, string[]> = new Map();
  // ERC20 is the only TRON tab with a `crossChainBridging` field (Stablecoin and
  // RealWorldAsset are hidden — they depend on @openzeppelin/community-contracts).
  omitFeatures.set('ERC20', ['superchain']);
  return omitFeatures;
}

// Shared with the CLI and MCP TRON surfaces via `@openzeppelin/wizard` so all
// three gate `superchain` the same way. The kind guard narrows the type for
// `sanitizeTronOptions` and skips kinds without a `crossChainBridging` field.
export function sanitizeOmittedFeatures(opts: GenericOptions) {
  if (opts.kind === 'ERC20') {
    sanitizeTronOptions(opts);
  }
}
