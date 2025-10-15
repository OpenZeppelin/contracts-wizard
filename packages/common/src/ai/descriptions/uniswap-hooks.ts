// IMPORTANT: This file must not have any imports since it is used in both Node and Deno environments,
// which have different requirements for file extensions in import statements.

export const uniswapHooksPrompts = {
  Hooks: 'Make a Uniswap v4 hook contract using the OpenZeppelin Uniswap Hooks library.',
};

export const uniswapHooksSharesDescriptions = {
  options:
    'The implementation used to represent position shares. Options include disabling shares or issuing ERC20, ERC6909, or ERC1155 tokens.',
  name: 'The name of the share token when ERC20 shares are enabled.',
  symbol: 'The symbol of the share token when ERC20 shares are enabled.',
  uri: 'The metadata URI used when ERC1155 shares are enabled.',
};

export const uniswapHooksDescriptions = {
  hook: 'The name of the Uniswap hook',
  currencySettler:
    'Whether to include the CurrencySettler utility to settle pending deltas with the PoolManager during flash accounting.',
  safeCast: 'Whether to include the SafeCast library for safe integer conversions when handling balances or fees.',
  transientStorage:
    'Whether to include the TransientSlot and SlotDerivation helpers for temporary state that clears at the end of the transaction.',
  shares: 'Configuration for optional share tokens exposed by the hook.',
  permissions:
    'Toggle lifecycle permissions to enable specific core hook callbacks. Required permissions are enforced automatically.',
  inputs: 'Hook-specific configuration inputs used by certain templates.',
};

export const uniswapHooksPermissionDescriptions = {
  beforeInitialize: 'Whether to enable the `_beforeInitialize` callback to run before pools are initialized.',
  afterInitialize: 'Whether to enable the `_afterInitialize` callback to react after pool initialization.',
  beforeAddLiquidity:
    'Whether to enable the `_beforeAddLiquidity` callback to validate or modify adds before liquidity is deposited.',
  afterAddLiquidity:
    'Whether to enable the `_afterAddLiquidity` callback to update accounting after liquidity is added.',
  beforeRemoveLiquidity:
    'Whether to enable the `_beforeRemoveLiquidity` callback to validate removals before liquidity is withdrawn.',
  afterRemoveLiquidity:
    'Whether to enable the `_afterRemoveLiquidity` callback to update accounting after liquidity is withdrawn.',
  beforeSwap: 'Whether to enable the `_beforeSwap` callback to inspect and optionally modify swap parameters.',
  afterSwap: 'Whether to enable the `_afterSwap` callback to perform post-swap accounting or logic.',
  beforeDonate: 'Whether to enable the `_beforeDonate` callback to run before donations are processed.',
  afterDonate: 'Whether to enable the `_afterDonate` callback to run after donations are processed.',
  beforeSwapReturnDelta:
    'Whether to allow `_beforeSwap` to return a `BeforeSwapDelta`, adjusting the assets that must be provided for the swap.',
  afterSwapReturnDelta:
    'Whether to allow `_afterSwap` to return an additional delta that adjusts the final swap settlement.',
  afterAddLiquidityReturnDelta:
    'Whether to allow `_afterAddLiquidity` to return a `BalanceDelta` that adjusts how liquidity addition balances are settled.',
  afterRemoveLiquidityReturnDelta:
    'Whether to allow `_afterRemoveLiquidity` to return a `BalanceDelta` that adjusts how liquidity removal balances are settled.',
};

export const uniswapHooksInputsDescriptions = {
  blockNumberOffset:
    'The number of blocks that must elapse after liquidity is added before it can be removed without penalties. Used by liquidity protection hooks.',
  maxAbsTickDelta:
    'The maximum absolute tick change that can be recorded per oracle observation. Lower values resist manipulation but lag during volatility.',
};
