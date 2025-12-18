// IMPORTANT: This file must not have any imports since it is used in both Node and Deno environments,
// which have different requirements for file extensions in import statements.

export const byHooksDescriptions = {
  BaseHook:
    'Base hook implementation that defines all hook entry points, security and permission helpers. Based on the Uniswap v4 periphery implementation. Hook entry points must be overridden and implemented by the inheriting hook to be used, with respective flags set in getHookPermissions.',
  BaseAsyncSwap:
    'Base implementation for async swaps that skip the v3-like swap implementation by taking the full swap input amount and returning a delta that nets out the specified amount to 0. Allows developers to implement arbitrary logic for executing swaps, including asynchronous swaps and custom swap-ordering. Mints ERC-6909 claim tokens for the specified currency and amount.',
  BaseCustomAccounting:
    'Base implementation for custom accounting and hook-owned liquidity. Enables tokens to be deposited via the hook to allow control and flexibility over how liquidity is computed. The hook is the sole owner of the liquidity and manages fees over liquidity shares accordingly. Designed to work with a single pool key.',
  BaseCustomCurve:
    'Base implementation for custom curves that overrides the default v3-like concentrated liquidity implementation. During a swap, calls a function to get the amount of tokens to be sent to the receiver. The return delta is then consumed and applied by the PoolManager. Does not include fee or salt mechanisms by default.',
  BaseDynamicFee:
    "Base implementation to apply a dynamic fee via the PoolManager's updateDynamicLPFee function. Allows hooks to update LP fees dynamically based on external conditions. Includes a poke function that can be called by anyone to update the fee. Alternative names to refer to the hook: 'Dynamic pool fee'.",
  BaseOverrideFee:
    "Base implementation for automatic dynamic fees applied before swaps. Allows hooks to override the pool's fee before a swap is processed using the override fee flag. The fee is calculated dynamically and applied to the swap. Alternative names to refer to the hook: 'Dynamic swap fee'.",
  BaseDynamicAfterFee:
    "Base implementation for dynamic target hook fees applied after swaps. Enforces a dynamic target for the unspecified currency during beforeSwap, where if the swap outcome is better than the target, any positive difference is taken as a hook fee. Fees are handled or distributed by the hook via afterSwapHandler. Alternative names to refer to the hook: 'Swap target enforcer'.",
  BaseHookFee:
    "Base implementation for applying hook fees to the unspecified currency of the swap. These fees are independent of the pool's LP fee and are charged as a percentage of the output amount after the swap completes. Fees are taken as ERC-6909 claims.",
  AntiSandwichHook:
    "Implements sandwich-resistant AMM design that guarantees no swaps get filled at a price better than the price at the beginning of the slot window. Within a slot window, swaps impact the pool asymmetrically for buys and sells. Only protects swaps in the zeroForOne direction. Alternative names to refer to the hook: 'Sandwich resistance'.",
  LiquidityPenaltyHook:
    "Just-in-Time (JIT) liquidity provisioning resistant hook that disincentivizes JIT attacks by penalizing LP fee collection during liquidity removal and disabling it during liquidity addition if liquidity was recently added. The penalty is donated to the pool's liquidity providers in range at the time of removal. Alternative names to refer to the hook: 'JIT liquidity resistance'.",
  LimitOrderHook:
    "Limit Order Mechanism hook that allows users to place limit orders at specific ticks outside of the current price range. Orders will be filled if the pool's price crosses the order's tick. Orders can be cancelled at any time until filled. Once completely filled, the resulting liquidity can be withdrawn from the pool.",
  ReHypothecationHook:
    "A Uniswap V4 hook that enables rehypothecation of liquidity positions. Allows users to deposit assets into yield-generating sources while providing liquidity to Uniswap pools Just-in-Time during swaps. Assets earn yield when idle and are temporarily injected as pool liquidity only when needed for swap execution, then immediately withdrawn back to yield sources. Users receive ERC20 shares representing their rehypothecated position. Alternative names to refer to the hook: 'Liquidity rehypothecation'.",
  BaseOracleHook:
    'A hook that enables a Uniswap V4 pool to record price observations and expose an oracle interface. Records cumulative tick values and provides time-weighted average price data. Allows increasing observation cardinality to store more historical price data. Provides observe function to get cumulative tick values for specified time periods.',
  OracleHookWithV3Adapters:
    'A hook that enables a Uniswap V4 pool to record price observations and expose an oracle interface with Uniswap V3-compatible adapters. Extends BaseOracleHook by automatically deploying standard and truncated V3 oracle adapters for each pool, making the oracle data compatible with existing V3 oracle interfaces and tools.',
} as const;

export const uniswapHooksPrompts = {
  Hooks: `Make a Uniswap v4 hook contract using the OpenZeppelin Uniswap Hooks library. ${Object.entries(
    byHooksDescriptions,
  )
    .map(([hookName, hookDescription]) => `${hookName}: ${hookDescription}`)
    .join(', ')}`,
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
