import { defineFunctions } from '@openzeppelin/wizard';
import { BaseCustomAccounting } from './BaseCustomAccounting';
import { BaseHook } from './BaseHook';
import type { Hook } from './index';

const BaseCustomCurve: Hook = {
  name: 'BaseCustomCurve',
  displayName: 'Custom Curve',
  category: 'Base',
  tooltipText: 'Allows for custom pricing logic and swap amount calculations, useful to implement a custom curve.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/base#BaseCustomCurve',
  sharesConfig: 'required',
  functions: {
    ...defineFunctions({
      ...BaseHook.functions,
      ...BaseCustomAccounting.functions,
      // Calculate the amount of the unspecified currency taken/settled during swap (required)
      _getUnspecifiedAmount: {
        kind: 'internal',
        args: [{ name: 'params', type: 'SwapParams calldata' }],
        returns: ['uint256'],
      },
      // Calculate the total LP fees to be paid for the swap (required)
      _getSwapFeeAmount: {
        kind: 'internal',
        args: [
          { name: 'params', type: 'SwapParams calldata' },
          { name: 'unspecifiedAmount', type: 'uint256' },
        ],
        returns: ['uint256'],
      },
      // Amounts used and shares burned on remove liquidity (required)
      _getAmountOut: {
        kind: 'internal',
        args: [{ name: 'params', type: 'RemoveLiquidityParams memory' }],
        returns: ['uint256', 'uint256', 'uint256'],
      },
      // Amounts used and shares minted on add liquidity (required)
      _getAmountIn: {
        kind: 'internal',
        args: [{ name: 'params', type: 'AddLiquidityParams memory' }],
        returns: ['uint256', 'uint256', 'uint256'],
      },
    }),
  },
  disabledFunctions: ['_beforeAddLiquidity', '_beforeRemoveLiquidity'],
  permissions: {
    beforeInitialize: true,
    afterInitialize: false,
    beforeAddLiquidity: true,
    afterAddLiquidity: false,
    beforeRemoveLiquidity: true,
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

export { BaseCustomCurve };
