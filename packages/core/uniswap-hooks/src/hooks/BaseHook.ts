import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const BaseHook: Hook = {
  name: 'BaseHook',
  displayName: 'Base Hook',
  category: 'Base',
  tooltipText: 'Provides standard entry points, permission checks, and validation utilities for building hooks.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/base#BaseHook',
  functions: {
    ...defineFunctions({
      // Permissions descriptor that inheritors must implement (required)
      getHookPermissions: {
        kind: 'public',
        mutability: 'pure',
        args: [],
        returns: ['Hooks.Permissions memory'],
      },
      // Initialize
      _beforeInitialize: {
        kind: 'internal',
        args: [
          { name: 'sender', type: 'address' },
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'sqrtPriceX96', type: 'uint160' },
        ],
        returns: ['bytes4'],
      },
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
      // Liquidity add/remove
      _beforeAddLiquidity: {
        kind: 'internal',
        args: [
          { name: 'sender', type: 'address' },
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'params', type: 'ModifyLiquidityParams calldata' },
          { name: 'hookData', type: 'bytes calldata' },
        ],
        returns: ['bytes4'],
      },
      _afterAddLiquidity: {
        kind: 'internal',
        args: [
          { name: 'sender', type: 'address' },
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'params', type: 'ModifyLiquidityParams calldata' },
          { name: 'delta0', type: 'BalanceDelta' },
          { name: 'delta1', type: 'BalanceDelta' },
          { name: 'hookData', type: 'bytes calldata' },
        ],
        returns: ['bytes4', 'BalanceDelta'],
      },
      _beforeRemoveLiquidity: {
        kind: 'internal',
        args: [
          { name: 'sender', type: 'address' },
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'params', type: 'ModifyLiquidityParams calldata' },
          { name: 'hookData', type: 'bytes calldata' },
        ],
        returns: ['bytes4'],
      },
      _afterRemoveLiquidity: {
        kind: 'internal',
        args: [
          { name: 'sender', type: 'address' },
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'params', type: 'ModifyLiquidityParams calldata' },
          { name: 'delta0', type: 'BalanceDelta' },
          { name: 'delta1', type: 'BalanceDelta' },
          { name: 'hookData', type: 'bytes calldata' },
        ],
        returns: ['bytes4', 'BalanceDelta'],
      },
      // Swap
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
      _afterSwap: {
        kind: 'internal',
        args: [
          { name: 'sender', type: 'address' },
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'params', type: 'SwapParams calldata' },
          { name: 'delta', type: 'BalanceDelta' },
          { name: 'hookData', type: 'bytes calldata' },
        ],
        returns: ['bytes4', 'int128'],
      },
      // Donate
      _beforeDonate: {
        kind: 'internal',
        args: [
          { name: 'sender', type: 'address' },
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'amount0', type: 'uint256' },
          { name: 'amount1', type: 'uint256' },
          { name: 'hookData', type: 'bytes calldata' },
        ],
        returns: ['bytes4'],
      },
      _afterDonate: {
        kind: 'internal',
        args: [
          { name: 'sender', type: 'address' },
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'amount0', type: 'uint256' },
          { name: 'amount1', type: 'uint256' },
          { name: 'hookData', type: 'bytes calldata' },
        ],
        returns: ['bytes4'],
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
    afterSwap: false,
    beforeDonate: false,
    afterDonate: false,
    beforeSwapReturnDelta: false,
    afterSwapReturnDelta: false,
    afterAddLiquidityReturnDelta: false,
    afterRemoveLiquidityReturnDelta: false,
  },
};

export { BaseHook };
