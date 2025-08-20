import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const LiquidityPenaltyHook: Hook = {
  name: 'LiquidityPenaltyHook',
  category: 'General',
  tooltipText:
    'JIT‑resistant: withholds and penalizes LP fees when liquidity is added then removed within a block window; penalties are donated to in‑range LPs.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/general#LiquidityPenaltyHook',
  functions: {
    ...defineFunctions({
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
};

export { LiquidityPenaltyHook };
