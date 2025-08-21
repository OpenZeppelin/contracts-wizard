import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const BaseAsyncSwap: Hook = {
  name: 'BaseAsyncSwap',
  category: 'Base',
  tooltipText:
    'Base implementation for asynchronous swaps that bypasses the default swap flow by netting the specified amount to zero, enabling custom execution and settlement.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/base#BaseAsyncSwap',
  functions: {
    ...defineFunctions({
      // no required overrides.
    }),
  },
  permissions: {
    beforeInitialize: false,
    afterInitialize: false,
    beforeAddLiquidity: false,
    beforeRemoveLiquidity: false,
    afterAddLiquidity: false,
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
