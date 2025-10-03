import { defineFunctions } from '@openzeppelin/wizard';
import { BaseHook } from './BaseHook';
import type { Hook } from './index';

const ReHypothecationHook: Hook = {
  name: 'ReHypothecationHook',
  displayName: 'Liquidity Rehypothecation',
  category: 'General',
  tooltipText:
    'Enables rehypothecation of liquidity positions by depositing assets into yield-generating sources while providing Just-in-Time liquidity during swaps.',
  tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/general#ReHypothecationHook',
  shares: 'ERC20',
  alreadyImplementsShares: true,
  inputs: [],
  disabledFunctions: [],
  functions: {
    ...defineFunctions({
      ...BaseHook.functions,
      // Pool key management
      getPoolKey: {
        kind: 'public',
        mutability: 'view',
        args: [],
        returns: ['PoolKey memory'],
      },
      // Rehypothecated liquidity management
      addReHypothecatedLiquidity: {
        kind: 'public',
        mutability: 'payable',
        args: [{ name: 'shares', type: 'uint256' }],
        returns: ['BalanceDelta'],
      },
      removeReHypothecatedLiquidity: {
        kind: 'public',
        mutability: 'nonpayable',
        args: [{ name: 'shares', type: 'uint256' }],
        returns: ['BalanceDelta'],
      },
      // Preview functions
      previewAmountsForShares: {
        kind: 'public',
        mutability: 'view',
        args: [{ name: 'shares', type: 'uint256' }],
        returns: ['uint256', 'uint256'],
      },
      // Tick boundary functions
      getTickLower: {
        kind: 'public',
        mutability: 'view',
        args: [],
        returns: ['int24'],
      },
      getTickUpper: {
        kind: 'public',
        mutability: 'view',
        args: [],
        returns: ['int24'],
      },
      // Yield source interface (abstract functions that must be implemented)
      getCurrencyYieldSource: {
        kind: 'public',
        mutability: 'view',
        args: [{ name: 'currency', type: 'Currency' }],
        returns: ['address'],
      },
      _depositToYieldSource: {
        kind: 'internal',
        args: [
          { name: 'currency', type: 'Currency' },
          { name: 'amount', type: 'uint256' },
        ],
        returns: [],
      },
      _withdrawFromYieldSource: {
        kind: 'internal',
        args: [
          { name: 'currency', type: 'Currency' },
          { name: 'amount', type: 'uint256' },
        ],
        returns: [],
      },
      _getAmountInYieldSource: {
        kind: 'internal',
        mutability: 'view',
        args: [{ name: 'currency', type: 'Currency' }],
        returns: ['uint256'],
      },
      // Internal helper functions
      _convertSharesToAmounts: {
        kind: 'internal',
        mutability: 'view',
        args: [{ name: 'shares', type: 'uint256' }],
        returns: ['uint256', 'uint256'],
      },
      _shareToAmount: {
        kind: 'internal',
        mutability: 'view',
        args: [
          { name: 'shares', type: 'uint256' },
          { name: 'currency', type: 'Currency' },
        ],
        returns: ['uint256'],
      },
      _getLiquidityToUse: {
        kind: 'internal',
        mutability: 'view',
        args: [],
        returns: ['uint256'],
      },
      _getHookPositionLiquidity: {
        kind: 'internal',
        mutability: 'view',
        args: [],
        returns: ['uint128'],
      },
      _modifyLiquidity: {
        kind: 'internal',
        args: [{ name: 'liquidityDelta', type: 'int256' }],
        returns: ['BalanceDelta'],
      },
      _resolveHookDelta: {
        kind: 'internal',
        args: [{ name: 'currency', type: 'Currency' }],
        returns: [],
      },
      _transferFromSenderToHook: {
        kind: 'internal',
        args: [
          { name: 'currency', type: 'Currency' },
          { name: 'amount', type: 'uint256' },
          { name: 'sender', type: 'address' },
        ],
        returns: [],
      },
      _transferFromHookToSender: {
        kind: 'internal',
        args: [
          { name: 'currency', type: 'Currency' },
          { name: 'amount', type: 'uint256' },
          { name: 'sender', type: 'address' },
        ],
        returns: [],
      },
    }),
  },
  permissions: {
    beforeInitialize: true,
    afterInitialize: false,
    beforeAddLiquidity: false,
    afterAddLiquidity: false,
    beforeRemoveLiquidity: false,
    afterRemoveLiquidity: false,
    beforeSwap: true,
    afterSwap: true,
    beforeDonate: false,
    afterDonate: false,
    beforeSwapReturnDelta: false,
    afterSwapReturnDelta: false,
    afterAddLiquidityReturnDelta: false,
    afterRemoveLiquidityReturnDelta: false,
  },
};

export { ReHypothecationHook };
