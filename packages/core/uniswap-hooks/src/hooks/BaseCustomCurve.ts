import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const BaseCustomCurve: Hook = {
  name: 'BaseCustomCurve',
  category: 'Base',
  tooltipText:
    'Base for custom swap curves overriding default pricing; define the unspecified amount during swaps. Builds on the custom accounting base.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/base#BaseCustomCurve',
  functions: {
    ...defineFunctions({
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
  permissions: {
    beforeInitialize: true,
    afterInitialize: false,
    beforeAddLiquidity: true,
    beforeRemoveLiquidity: true,
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

export { BaseCustomCurve };
