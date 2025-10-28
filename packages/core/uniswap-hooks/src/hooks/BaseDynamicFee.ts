import { defineFunctions } from '@openzeppelin/wizard';
import { BaseHook } from './BaseHook';
import type { Hook } from './index';

const BaseDynamicFee: Hook = {
  name: 'BaseDynamicFee',
  displayName: 'Dynamic Pool Fee',
  category: 'Fee',
  tooltipText:
    'Applies a dynamic fee to the entire pool, determined by <code>_getFee</code> and updated upon calling <code>_poke</code>.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/fee#BaseDynamicFee',
  shares: 'optional',
  alreadyImplementsShares: false,
  inputs: [],
  disabledFunctions: [],
  functions: {
    ...defineFunctions({
      ...BaseHook.functions,
      // dynamically override the fee (required)
      _getFee: {
        kind: 'internal',
        args: [{ name: 'key', type: 'PoolKey calldata' }],
        returns: ['uint24'],
      },
      // poke the fee (internal)
      _poke: {
        kind: 'internal',
        args: [{ name: 'key', type: 'PoolKey calldata' }],
      },
      // poke the fee (public) (must be protected)
      poke: {
        kind: 'public',
        args: [{ name: 'key', type: 'PoolKey calldata' }],
        returns: [],
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
