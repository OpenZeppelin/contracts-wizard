/**
 * Tippy.js properties for generic Superchain tooltips.
 */
export const superchainGenericTooltipProps: { [prop: string]: string | boolean } = {
  content:
    '<strong>Important:</strong> Only available on chains in the Superchain.',
  trigger: 'manual',
  placement: 'bottom',
  maxWidth: '22em',
  allowHTML: true,
  interactive: true,
};

const ERC20_REQUIREMENTS =
  ' Requires deploying your contract to the same address on every chain in the Superchain. <a class="light-link" href="https://docs.optimism.io/stack/interop/superchain-erc20#requirements" target="_blank" rel="noopener noreferrer">Read more.</a>';

/**
 * Tippy.js properties for the SuperchainERC20 tooltip.
 */
export const superchainERC20TooltipProps: { [prop: string]: string | boolean } = {
  ...superchainGenericTooltipProps,
  content: superchainGenericTooltipProps.content + ERC20_REQUIREMENTS,
};
