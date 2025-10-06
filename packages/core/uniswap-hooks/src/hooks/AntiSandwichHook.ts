import { defineFunctions } from '@openzeppelin/wizard';
import { BaseHook } from './BaseHook';
import type { Hook } from './index';

const AntiSandwichHook: Hook = {
  name: 'AntiSandwichHook',
  displayName: 'Sandwich Resistance',
  category: 'General',
  tooltipText:
    'Maintains the swap pricing in the zeroForOne direction anchored to the beginning-of-block price, nullifying the profitability of sandwich attacks.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/general#AntiSandwichHook',
  shares: 'optional',
  alreadyImplementsShares: false,
  inputs: [],
  disabledFunctions: [],
  functions: {
    ...defineFunctions({
      ...BaseHook.functions,
      // handle the fee after the swap (required)
      _afterSwapHandler: {
        kind: 'internal',
        args: [
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'params', type: 'SwapParams calldata' },
          { name: 'delta', type: 'BalanceDelta' },
          { name: 'targetUnspecifiedAmount', type: 'uint256' },
          { name: 'feeAmount', type: 'uint256' },
        ],
      },
    }),
  },
  permissions: {
    beforeInitialize: false,
    afterInitialize: false,
    beforeAddLiquidity: false,
    afterAddLiquidity: false,
    beforeRemoveLiquidity: false,
    afterRemoveLiquidity: false,
    beforeSwap: true,
    afterSwap: true,
    beforeDonate: false,
    afterDonate: false,
    beforeSwapReturnDelta: false,
    afterSwapReturnDelta: true,
    afterAddLiquidityReturnDelta: false,
    afterRemoveLiquidityReturnDelta: false,
  },
};

export { AntiSandwichHook };
