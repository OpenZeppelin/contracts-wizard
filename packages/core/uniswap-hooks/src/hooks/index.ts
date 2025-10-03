import type { BaseFunction } from '@openzeppelin/wizard';

import { BaseHook } from './BaseHook';
import { BaseAsyncSwap } from './BaseAsyncSwap';
import { BaseCustomAccounting } from './BaseCustomAccounting';
import { BaseCustomCurve } from './BaseCustomCurve';
import { BaseDynamicFee } from './BaseDynamicFee';
import { BaseOverrideFee } from './BaseOverrideFee';
import { BaseDynamicAfterFee } from './BaseDynamicAfterFee';
import { BaseHookFee } from './BaseHookFee';
import { AntiSandwichHook } from './AntiSandwichHook';
import { LimitOrderHook } from './LimitOrderHook';
import { LiquidityPenaltyHook } from './LiquidityPenaltyHook';
import { ReHypothecationHook } from './ReHypothecationHook';

export type HookCategory = 'Base' | 'Fee' | 'General';

/**
 * Hook configuration object that defines the structure and behavior of each hook.
 * @property name - The Smart Contract Name of the hook
 * @property displayName - Human-readable name shown in the UI
 * @property category - Classification category for organizing hooks
 * @property tooltipText - Descriptive text displayed in tooltips (supports HTML)
 * @property tooltipLink - URL to documentation for this hook
 * @property permissions - Bitmap of hook lifecycle permissions
 * @property functions - Map of relevant function definitions from the hook for it's configuration on the wizard
 * @property disabledFunctions - idk
 * @property shares - Configuration for hook shares functionality
 * @property alreadyImplementsShares - Whether this hook implements already implements shares and doesn't require to inherit.
 * @property inputs - Array of user-configurable input parameters for the wizard UI.
 */
export type Hook = {
  name: HookName;
  displayName: string;
  category: HookCategory;
  tooltipText: string;
  tooltipLink: string;
  permissions: Permissions;
  functions: Record<string, BaseFunction>;
  disabledFunctions: string[];
  shares: SharesConfig;
  alreadyImplementsShares: boolean;
  inputs: HookInput[];
};

export const HOOKS = {
  BaseHook,
  BaseAsyncSwap,
  BaseCustomAccounting,
  BaseCustomCurve,
  BaseDynamicFee,
  BaseOverrideFee,
  BaseDynamicAfterFee,
  BaseHookFee,
  AntiSandwichHook,
  LiquidityPenaltyHook,
  LimitOrderHook,
  ReHypothecationHook,
} as const;

export type HookName = keyof typeof HOOKS;
export type HookDictionary = Record<HookName, Hook>;

export const PERMISSIONS = [
  'beforeInitialize',
  'afterInitialize',
  'beforeAddLiquidity',
  'beforeRemoveLiquidity',
  'afterAddLiquidity',
  'afterRemoveLiquidity',
  'beforeSwap',
  'afterSwap',
  'beforeDonate',
  'afterDonate',
  'beforeSwapReturnDelta',
  'afterSwapReturnDelta',
  'afterAddLiquidityReturnDelta',
  'afterRemoveLiquidityReturnDelta',
] as const;

export type Permission = (typeof PERMISSIONS)[number];
export type Permissions = Record<Permission, boolean>;

export const PAUSABLE_PERMISSIONS: Permission[] = [
  'beforeSwap',
  'beforeAddLiquidity',
  'beforeRemoveLiquidity',
  'beforeDonate',
];

export type Shares = {
  options: false | 'ERC20' | 'ERC6909' | 'ERC1155';
  name?: string;
  symbol?: string;
  uri?: string;
};

export function specificSharesType(sharesConfig: SharesConfig): boolean {
  return sharesConfig === 'ERC20' || sharesConfig === 'ERC6909' || sharesConfig === 'ERC1155';
}

export type SharesConfig = 'required' | 'optional' | 'disabled' | 'ERC20' | 'ERC6909' | 'ERC1155';

export type HookInput = {
  label: string;
  value: string;
  type: 'string' | 'number';
};
