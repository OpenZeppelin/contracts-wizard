import { defineFunctions } from '@openzeppelin/wizard';
import { BaseHook } from './BaseHook';
import type { Hook } from './index';

const BaseOracleHook: Hook = {
  name: 'BaseOracleHook',
  displayName: 'Oracle Hook',
  category: 'Oracles',
  tooltipText:
    'Enables a Uniswap V4 pool to record price observations and expose an oracle interface. Records tick observations on every swap and allows querying time-weighted average prices.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/oracle#BaseOracleHook',
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
      ...BaseHook.functions,
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
      _beforeSwap: {
        kind: 'internal',
        args: [
          { name: 'sender', type: 'address' },
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'params', type: 'SwapParams calldata' },
          { name: 'hookData', type: 'bytes calldata' },
        ],
        returns: ['bytes4', 'BeforeSwapDelta', 'uint24'],
      },
      observe: {
        kind: 'external',
        mutability: 'view',
        args: [
          { name: 'secondsAgos', type: 'uint32[] calldata' },
          { name: 'underlyingPoolId', type: 'PoolId' },
        ],
        returns: ['int56[] memory', 'int56[] memory'],
      },
      increaseObservationCardinalityNext: {
        kind: 'public',
        args: [
          { name: 'observationCardinalityNext', type: 'uint16' },
          { name: 'underlyingPoolId', type: 'PoolId' },
        ],
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

export { BaseOracleHook };
