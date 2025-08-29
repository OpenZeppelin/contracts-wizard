import { BaseHook } from './BaseHook';
import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const BaseDynamicFee: Hook = {
  name: 'BaseDynamicFee',
  displayName: 'Dynamic Pool Fee',
  category: 'Fee',
  tooltipText:
    'Applies a dynamic fee in a per-pool basis; determined by <code>_getFee</code> and applied upon calling <code>poke</code>.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/fee#BaseDynamicFee',
  functions: {
    ...defineFunctions({
      ...BaseHook.functions,
      // dynamically override the fee (required)
      _getFee: {
        kind: 'internal',
        args: [{ name: 'key', type: 'PoolKey calldata' }],
        returns: ['uint24'],
      },
      // poke the fee (optional override)
      poke: {
        kind: 'public', // external/public for our generator purposes
        args: [{ name: 'key', type: 'PoolKey calldata' }],
      },
    }),
  },
  permissions: {
    beforeInitialize: false,
    afterInitialize: true,
    beforeAddLiquidity: false,
    afterAddLiquidity: false,
    beforeRemoveLiquidity: false,
    afterRemoveLiquidity: false,
    beforeSwap: false,
    afterSwap: false,
    beforeDonate: false,
    afterDonate: false,
    beforeSwapReturnDelta: false,
    afterSwapReturnDelta: false,
    afterAddLiquidityReturnDelta: false,
    afterRemoveLiquidityReturnDelta: false,
  },
};

export { BaseDynamicFee };
