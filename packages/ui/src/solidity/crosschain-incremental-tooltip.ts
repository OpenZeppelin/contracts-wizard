import { manualNoticeTooltipProps } from './manual-notice-tooltip';

/**
 * Tippy.js properties for the warning shown when combining Auto Increment Ids with Cross-Chain Bridging.
 */
export const crosschainIncrementalTooltipProps = manualNoticeTooltipProps(
  '<strong>Important:</strong> Token IDs auto-increment independently on each chain. Mint only on a single chain and link counterparts that do not mint, otherwise colliding IDs can strand bridged tokens.',
);
