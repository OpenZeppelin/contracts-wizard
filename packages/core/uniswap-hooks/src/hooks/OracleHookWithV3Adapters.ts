import { defineFunctions } from '@openzeppelin/wizard';
import { BaseOracleHook } from './BaseOracleHook';
import type { Hook } from './index';

const OracleHookWithV3Adapters: Hook = {
  name: 'OracleHookWithV3Adapters',
  displayName: 'Oracle Hook V3 adapted',
  category: 'Oracles',
  tooltipText:
    'Extends the Oracle Hook with Uniswap V3-compatible adapter contracts. Automatically deploys standard and truncated oracle adapters on pool initialization, enabling seamless integration with V3 oracle consumers.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/oracle#OracleHookWithV3Adapters',
  shares: 'optional',
  alreadyImplementsShares: false,
  inputs: [
    {
      name: 'maxAbsTickDelta',
      label: 'Max Absolute Tick Delta',
      type: 'number',
      placeholder: '887272',
      tooltipText:
        'Limits tick changes per observation in the truncated oracle. Lower values resist manipulation but lag during real volatility; higher values respond faster but are more vulnerable to attacks. Default: 887272 (no truncation).',
    },
  ],
  disabledFunctions: [],
  functions: {
    ...defineFunctions({
      ...BaseOracleHook.functions,
      _afterInitialize: {
        kind: 'internal',
        args: [
          { name: 'sender', type: 'address' },
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'sqrtPriceX96', type: 'uint160' },
          { name: 'tick', type: 'int24' },
        ],
        returns: ['bytes4'],
      },
      standardAdapter: {
        kind: 'public',
        mutability: 'view',
        args: [{ name: 'poolId', type: 'PoolId' }],
        returns: ['address'],
      },
      truncatedAdapter: {
        kind: 'public',
        mutability: 'view',
        args: [{ name: 'poolId', type: 'PoolId' }],
        returns: ['address'],
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

export { OracleHookWithV3Adapters };
