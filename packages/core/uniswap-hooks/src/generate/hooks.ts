import { infoOptions, accessOptions, generateAlternatives } from '@openzeppelin/wizard';
import type { HooksOptions } from '../hooks';
import { HOOKS, type HookName, type Shares, type Permissions } from '../hooks/index';

const booleanOptions = [true, false];

const sharesOptions: Shares[] = [
  { options: false, name: 'MyShares', symbol: 'MSH' },
  { options: 'ERC20', name: 'MyShares', symbol: 'MSH' },
  { options: 'ERC6909', name: 'MyShares', symbol: 'MSH' },
] as const;

// Is not needed to generate all permutations, default to false.
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
