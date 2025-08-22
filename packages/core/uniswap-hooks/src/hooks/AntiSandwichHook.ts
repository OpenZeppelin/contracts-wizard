import { BaseHook } from './BaseHook';
import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const AntiSandwichHook: Hook = {
  name: 'AntiSandwichHook',
  category: 'General',
  tooltipText: 'Anchors swap pricing to the beginning-of-block state to deter intra-block sandwich manipulation.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/general#AntiSandwichHook',
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
      // determine the target unspecified amount (optional override)
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
