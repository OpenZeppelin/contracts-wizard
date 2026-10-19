import { manualNoticeTooltipProps } from './manual-notice-tooltip';

/**
 * Tippy.js properties for the Chainlink ACE notice shown when the user selects Chainlink ACE.
 */
export const aceNoticeTooltipProps = manualNoticeTooltipProps(
  '<strong>Important:</strong> Identity-based policies will not apply until you deploy identity and credential registries and connect them to your Policy Engine. <a class="light-link" href="https://docs.chain.link/ace/concepts/cross-chain-identity" target="_blank" rel="noopener noreferrer">Read more.</a>',
);
