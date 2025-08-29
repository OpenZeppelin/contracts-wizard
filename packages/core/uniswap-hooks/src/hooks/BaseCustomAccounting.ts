import { defineFunctions } from '@openzeppelin/wizard';
import { BaseHook } from './BaseHook';
import type { Hook } from './index';

const BaseCustomAccounting: Hook = {
  name: 'BaseCustomAccounting',
  displayName: 'Custom Accounting',
  category: 'Base',
  tooltipText:
    'Custom accounting and hook-owned liquidity overrides how liquidity modifications are computed and how liquidiy shares are minted/burned.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/base#BaseCustomAccounting',
  functions: {
    ...defineFunctions({
      ...BaseHook.functions,
      // Liquidity modification (required)
      _getAddLiquidity: {
        kind: 'internal',
        args: [
          { name: 'sqrtPriceX96', type: 'uint160' },
          { name: 'params', type: 'AddLiquidityParams memory' },
        ],
        returns: ['bytes memory', 'uint256'],
      },
      _getRemoveLiquidity: {
        kind: 'internal',
        args: [{ name: 'params', type: 'RemoveLiquidityParams memory' }],
        returns: ['bytes memory', 'uint256'],
      },
      // Shares accounting (required)
      _mint: {
        kind: 'internal',
        args: [
          { name: 'params', type: 'AddLiquidityParams memory' },
          { name: 'callerDelta', type: 'BalanceDelta' },
          { name: 'feesAccrued', type: 'BalanceDelta' },
          { name: 'shares', type: 'uint256' },
        ],
        returns: [],
      },
      _burn: {
        kind: 'internal',
        args: [
          { name: 'params', type: 'RemoveLiquidityParams memory' },
          { name: 'callerDelta', type: 'BalanceDelta' },
          { name: 'feesAccrued', type: 'BalanceDelta' },
          { name: 'shares', type: 'uint256' },
        ],
        returns: [],
      },
      // optional overrides
      addLiquidity: {
        kind: 'public',
        mutability: 'payable',
        args: [{ name: 'params', type: 'AddLiquidityParams calldata' }],
        returns: ['BalanceDelta'],
      },
      removeLiquidity: {
        kind: 'public',
        args: [{ name: 'params', type: 'RemoveLiquidityParams calldata' }],
        returns: ['BalanceDelta'],
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

export { BaseCustomAccounting };
