import { defineFunctions } from '@openzeppelin/wizard';
import { BaseHook } from './BaseHook';
import type { Hook } from './index';

const BaseHookFee: Hook = {
  name: 'BaseHookFee',
  displayName: 'Hook Fee',
  category: 'Fee',
  tooltipText:
    "Base implementation for applying hook fees to the unspecified currency of the swap, independent of the pool's LP fee.",
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/fee#BaseHookFee',
  shares: 'optional',
  alreadyImplementsShares: false,
  inputs: [],
  disabledFunctions: [],
  functions: {
    ...defineFunctions({
      ...BaseHook.functions,
      // Determine the hook fee (required)
      _getHookFee: {
        kind: 'internal',
        mutability: 'view',
        args: [
          { name: 'sender', type: 'address' },
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'params', type: 'SwapParams calldata' },
          { name: 'delta', type: 'BalanceDelta' },
          { name: 'hookData', type: 'bytes calldata' },
        ],
        returns: ['uint24'],
      },
      // Handle the accumulated hook fees (required)
      handleHookFees: {
        kind: 'public',
        args: [{ name: 'currencies', type: 'Currency[] memory' }],
        returns: [],
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
    beforeSwap: false,
    afterSwap: true,
    beforeDonate: false,
    afterDonate: false,
    beforeSwapReturnDelta: false,
    afterSwapReturnDelta: true,
    afterAddLiquidityReturnDelta: false,
    afterRemoveLiquidityReturnDelta: false,
  },
};

export { BaseHookFee };
