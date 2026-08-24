import type { GenericOptions, Kind } from '@openzeppelin/wizard';
import { sanitizeTronOptions } from '@openzeppelin/wizard';

/**
 * Features that don't apply on TRON: OP Stack superchain bridging, ERC-721/1155
 * native crosschain (not in TRON Contracts 5.6), and Governor crosschain execution.
 */
export function defineOmitFeatures(): Map<Kind, string[]> {
  const omitFeatures: Map<Kind, string[]> = new Map();
  omitFeatures.set('ERC20', ['superchain']);
  omitFeatures.set('ERC721', ['crossChainBridging']);
  omitFeatures.set('ERC1155', ['crossChainBridging']);
  omitFeatures.set('Governor', ['crossChainExecution']);
  return omitFeatures;
}

export function sanitizeOmittedFeatures(opts: GenericOptions) {
  sanitizeTronOptions(opts);
}
