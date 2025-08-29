import { defineFunctions } from '@openzeppelin/wizard';
import { BaseHook } from './BaseHook';
import type { Hook } from './index';

const BaseAsyncSwap: Hook = {
  name: 'BaseAsyncSwap',
  displayName: 'Async Swaps',
  category: 'Base',
  tooltipText:
    'Overrides the default swap flow, enabling custom execution and settlement, such as swap queuing and/or reordering.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/base#BaseAsyncSwap',
  functions: {
    ...defineFunctions({
      ...BaseHook.functions,
      // no required overrides.
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
    afterSwap: false,
    beforeDonate: false,
    afterDonate: false,
    beforeSwapReturnDelta: true,
    afterSwapReturnDelta: false,
    afterAddLiquidityReturnDelta: false,
    afterRemoveLiquidityReturnDelta: false,
  },
};

export { BaseAsyncSwap };
