import type { HooksOptions } from '../hooks';
import { HOOKS, type HookName, type Shares, type Permissions } from '../hooks/index';
import { accessOptions } from '@openzeppelin/wizard/src/set-access-control';
import { infoOptions } from '@openzeppelin/wizard/src/set-info';
import { generateAlternatives } from '@openzeppelin/wizard/src/generate/alternatives';

const booleanOptions = [true, false];

const sharesOptions: Shares[] = [
  { options: false, name: 'MyShares', symbol: 'MSH' },
  { options: 'ERC20', name: 'MyShares', symbol: 'MSH' },
  { options: 'ERC6909', name: 'MyShares', symbol: 'MSH' },
] as const;

// Is not needed to generate all permutations, just the default one.
const permissionsOptions: Permissions[] = [
  {
    beforeInitialize: false,
    afterInitialize: false,
    beforeAddLiquidity: false,
    beforeRemoveLiquidity: false,
    afterAddLiquidity: false,
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
] as const;

const hooksOptions: HookName[] = Object.keys(HOOKS) as HookName[];

// @TODO: remove, faster to test compilation one by one.
// const hooksOptions: HookName[] = [
// 'BaseHook',
// 'BaseAsyncSwap',
// 'BaseCustomAccounting',
// 'BaseCustomCurve',
// 'BaseDynamicAfterFee',
// 'BaseDynamicFee',
// 'BaseOverrideFee',
// 'AntiSandwichHook',
// 'LiquidityPenaltyHook',
// 'LimitOrderHook',
// ];

const blueprint = {
  hook: hooksOptions as readonly HookName[],
  name: ['MyHook'] as const,
  pausable: booleanOptions,
  currencySettler: booleanOptions,
  safeCast: booleanOptions,
  transientStorage: booleanOptions,
  access: accessOptions,
  // Hooks are not upgradeable yet; fix to false
  upgradeable: [false] as const,
  info: infoOptions,
  shares: sharesOptions,
  permissions: permissionsOptions,
};

export function* generateHooksOptions(): Generator<Required<HooksOptions>> {
  yield* generateAlternatives(blueprint);
}
