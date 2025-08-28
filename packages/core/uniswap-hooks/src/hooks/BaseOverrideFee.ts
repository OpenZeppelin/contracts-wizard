import { BaseHook } from './BaseHook';
import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const BaseOverrideFee: Hook = {
  name: 'BaseOverrideFee',
  category: 'Fee',
  tooltipText: 'Applies a dynamic fee in a per-swap basis, determined by the <code>_getFee</code> function.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/fee#BaseOverrideFee',
  functions: {
    ...defineFunctions({
      ...BaseHook.functions,
      // dynamically override the fee (required)
      _getFee: {
        kind: 'internal',
        args: [
          { name: 'sender', type: 'address' },
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'params', type: 'SwapParams calldata' },
          { name: 'hookData', type: 'bytes calldata' },
        ],
        returns: ['uint24'],
      },
    }),
  },
  permissions: {
    beforeInitialize: true,
    afterInitialize: false,
    beforeAddLiquidity: false,
    afterAddLiquidity: false,
    beforeRemoveLiquidity: false,
    afterRemoveLiquidity: false,
    beforeSwap: true,
    afterSwap: false,
    beforeDonate: false,
    afterDonate: false,
    beforeSwapReturnDelta: false,
    afterSwapReturnDelta: false,
    afterAddLiquidityReturnDelta: false,
    afterRemoveLiquidityReturnDelta: false,
  },
};

export { BaseOverrideFee };
