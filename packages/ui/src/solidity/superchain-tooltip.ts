import { manualNoticeTooltipProps } from './manual-notice-tooltip';

/**
 * Tippy.js properties for the Superchain tooltip.
 */
export const superchainTooltipProps = manualNoticeTooltipProps(
  '<strong>Important:</strong> Only available on chains in the Superchain. Requires deploying your contract to the same address on every chain in the Superchain. <a class="light-link" href="https://docs.optimism.io/stack/interop/superchain-erc20#requirements" target="_blank" rel="noopener noreferrer">Read more.</a>',
);
