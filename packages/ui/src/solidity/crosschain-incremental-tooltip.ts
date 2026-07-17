/**
 * Tippy.js properties for the warning shown when combining Auto Increment Ids with Cross-Chain Bridging.
 */
export const crosschainIncrementalTooltipProps: { [prop: string]: string | boolean } = {
  content:
    '<strong>Important:</strong> Token IDs auto-increment independently on each chain. Mint only on a single chain and link counterparts that do not mint, otherwise colliding IDs can strand bridged tokens.',
  trigger: 'manual',
  placement: 'bottom',
  maxWidth: '22em',
  allowHTML: true,
  interactive: true,
};
