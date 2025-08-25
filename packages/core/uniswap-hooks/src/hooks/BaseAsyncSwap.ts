import { BaseHook } from './BaseHook';
import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const BaseAsyncSwap: Hook = {
  name: 'BaseAsyncSwap',
  category: 'Base',
  tooltipText:
    'Asynchronous swaps overrides the default swap flow enabling custom execution and settlement, such as swap queuing and/or reordering.',
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
