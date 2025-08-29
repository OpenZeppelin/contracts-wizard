import { BaseHook } from './BaseHook';
import type { Hook } from './index';
import { defineFunctions } from '@openzeppelin/wizard/src/utils/define-functions';

const LimitOrderHook: Hook = {
  name: 'LimitOrderHook',
  displayName: 'Limit Orders',
  category: 'General',
  tooltipText:
    'Out‑of‑range single-currency limit orders that get executed when the price is reached, accruing fees to the order and supporting place/cancel/withdraw.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/general#LimitOrderHook',
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
      placeOrder: {
        kind: 'public',
        args: [
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'tick', type: 'int24' },
          { name: 'zeroForOne', type: 'bool' },
          { name: 'liquidity', type: 'uint128' },
        ],
      },
      cancelOrder: {
        kind: 'public',
        args: [
          { name: 'key', type: 'PoolKey calldata' },
          { name: 'tickLower', type: 'int24' },
          { name: 'zeroForOne', type: 'bool' },
          { name: 'to', type: 'address' },
        ],
      },
      withdraw: {
        kind: 'public',
        args: [
          { name: 'orderId', type: 'OrderIdLibrary.OrderId' },
          { name: 'to', type: 'address' },
        ],
        returns: ['uint256', 'uint256'],
      },
      unlockCallback: {
        kind: 'public',
        args: [{ name: 'rawData', type: 'bytes calldata' }],
        returns: ['bytes memory'],
      },
      getTickLowerLast: {
        kind: 'public',
        mutability: 'view',
        args: [{ name: 'poolId', type: 'PoolId' }],
        returns: ['int24'],
      },
      getOrderId: {
        kind: 'public',
        mutability: 'view',
        args: [
          { name: 'key', type: 'PoolKey memory' },
          { name: 'tickLower', type: 'int24' },
          { name: 'zeroForOne', type: 'bool' },
        ],
        returns: ['OrderIdLibrary.OrderId'],
      },
      getOrderLiquidity: {
        kind: 'public',
        mutability: 'view',
        args: [
          { name: 'orderId', type: 'OrderIdLibrary.OrderId' },
          { name: 'owner', type: 'address' },
        ],
        returns: ['uint256'],
      },
      getHookPermissions: {
        kind: 'public',
        mutability: 'pure',
        args: [],
        returns: ['Hooks.Permissions memory'],
      },
      _handlePlaceCallback: {
        kind: 'internal',
        args: [{ name: 'placeData', type: 'PlaceCallbackData memory' }],
        returns: ['uint256', 'uint256'],
      },
      _handleCancelCallback: {
        kind: 'internal',
        args: [{ name: 'cancelData', type: 'CancelCallbackData memory' }],
        returns: ['uint256', 'uint256'],
      },
      _handleWithdrawCallback: {
        kind: 'internal',
        args: [{ name: 'withdrawData', type: 'WithdrawCallbackData memory' }],
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
    beforeSwap: false,
    afterSwap: true,
    beforeDonate: false,
    afterDonate: false,
    beforeSwapReturnDelta: false,
    afterSwapReturnDelta: false,
    afterAddLiquidityReturnDelta: false,
    afterRemoveLiquidityReturnDelta: false,
  },
};

export { LimitOrderHook };
