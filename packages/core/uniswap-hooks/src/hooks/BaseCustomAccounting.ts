import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const BaseCustomAccounting: Hook = {
  name: 'BaseCustomAccounting',
  category: 'Base',
  tooltipText:
    'Base for custom accounting and hook-owned liquidity; implement how liquidity changes are computed and how liquidiy positions shares are minted/burned. Intended for a single pool key per instance.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/base#BaseCustomAccounting',
  functions: {
    ...defineFunctions({
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
    }),
  },
};

export { BaseCustomAccounting };
