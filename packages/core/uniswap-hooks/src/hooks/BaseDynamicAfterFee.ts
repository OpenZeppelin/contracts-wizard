import { defineFunctions } from '@openzeppelin/wizard';
import { BaseHook } from './BaseHook';
import type { Hook } from './index';

const BaseDynamicAfterFee: Hook = {
  name: 'BaseDynamicAfterFee',
  displayName: 'Swap Target Enforcer',
  category: 'Fee',
  tooltipText:
    'Enforces a target for swap outcomes determined by <code>_getTargetUnspecified</code>, capturing any better-than-expected results as hook fees that can be handled or distributed via <code>_afterSwapHandler</code>.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/fee#BaseDynamicAfterFee',
  sharesConfig: 'optional',
  functions: {
    ...defineFunctions({
      ...BaseHook.functions,
      // determine the target unspecified amount (required)
      _getTargetUnspecified: {
        kind: 'internal',
        args: [
          { name: 'sender', type: 'address' },
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'params', type: 'SwapParams calldata' },
          { name: 'hookData', type: 'bytes calldata' },
        ],
        returns: ['uint256', 'bool'],
      },
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

export { BaseDynamicAfterFee };
