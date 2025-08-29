import { defineFunctions } from '@openzeppelin/wizard';
import { BaseHook } from './BaseHook';
import type { Hook } from './index';

const LiquidityPenaltyHook: Hook = {
  name: 'LiquidityPenaltyHook',
  displayName: 'JIT Liquidity Resistance',
  category: 'General',
  tooltipText:
    'Just-in-Time (JIT) resistance; penalizes LP fee collection when liquidity is added/removed before <code>_blockNumberOffset</code> blocks, donating penalties to in‑range LPs.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/general#LiquidityPenaltyHook',
  functions: {
    ...defineFunctions({
      ...BaseHook.functions,
      _afterAddLiquidity: {
        kind: 'internal',
        args: [
          { name: 'sender', type: 'address' },
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'params', type: 'ModifyLiquidityParams calldata' },
          { name: 'delta', type: 'BalanceDelta' },
          { name: 'feeDelta', type: 'BalanceDelta' },
          { name: 'hookData', type: 'bytes calldata' },
        ],
        returns: ['bytes4', 'BalanceDelta'],
      },
      _afterRemoveLiquidity: {
        kind: 'internal',
        args: [
          { name: 'sender', type: 'address' },
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'params', type: 'ModifyLiquidityParams calldata' },
          { name: 'delta', type: 'BalanceDelta' },
          { name: 'feeDelta', type: 'BalanceDelta' },
          { name: 'hookData', type: 'bytes calldata' },
        ],
        returns: ['bytes4', 'BalanceDelta'],
      },
      _getBlockNumber: {
        kind: 'internal',
        mutability: 'view',
        args: [],
        returns: ['uint48'],
      },
      getBlockNumberOffset: {
        kind: 'public',
        mutability: 'view',
        args: [],
        returns: ['uint48'],
      },
      getLastAddedLiquidityBlock: {
        kind: 'public',
        mutability: 'view',
        args: [
          { name: 'poolId', type: 'PoolId' },
          { name: 'positionKey', type: 'bytes32' },
        ],
        returns: ['uint48'],
      },
      getWithheldFees: {
        kind: 'public',
        mutability: 'view',
        args: [
          { name: 'poolId', type: 'PoolId' },
          { name: 'positionKey', type: 'bytes32' },
        ],
        returns: ['BalanceDelta'],
      },
      _updateLastAddedLiquidityBlock: {
        kind: 'internal',
        args: [
          { name: 'poolId', type: 'PoolId' },
          { name: 'positionKey', type: 'bytes32' },
        ],
      },
      _takeFeesToHook: {
        kind: 'internal',
        args: [
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'positionKey', type: 'bytes32' },
          { name: 'feeDelta', type: 'BalanceDelta' },
        ],
      },
      _settleFeesFromHook: {
        kind: 'internal',
        args: [
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'positionKey', type: 'bytes32' },
        ],
        returns: ['BalanceDelta'],
      },
      _calculateLiquidityPenalty: {
        kind: 'internal',
        args: [
          { name: 'feeDelta', type: 'BalanceDelta' },
          { name: 'lastAddedLiquidityBlock', type: 'uint48' },
        ],
        returns: ['BalanceDelta'],
      },
    }),
  },
  permissions: {
    beforeInitialize: false,
    afterInitialize: false,
    beforeAddLiquidity: false,
    afterAddLiquidity: true,
    beforeRemoveLiquidity: false,
    afterRemoveLiquidity: true,
    beforeSwap: false,
    afterSwap: false,
    beforeDonate: false,
    afterDonate: false,
    beforeSwapReturnDelta: false,
    afterSwapReturnDelta: false,
    afterAddLiquidityReturnDelta: true,
    afterRemoveLiquidityReturnDelta: true,
  },
};

export { LiquidityPenaltyHook };
