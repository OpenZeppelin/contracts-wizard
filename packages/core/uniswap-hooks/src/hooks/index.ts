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
import { BaseOracleHook } from './BaseOracleHook';
import { OracleHookWithV3Adapters } from './OracleHookWithV3Adapters';

export type HookCategory = 'Base' | 'Fee' | 'General' | 'Oracles';

/**
 * Hook configuration object that defines the structure and behavior of each hook.
 * @property name - The Smart Contract Name of the hook
 * @property displayName - Human-readable name shown in the UI
 * @property category - Classification category for organizing hooks
 * @property tooltipText - Descriptive text displayed in tooltips (supports HTML)
 * @property tooltipLink - URL to documentation for this hook
 * @property permissions - Bitmap of hook lifecycle permissions
 * @property functions - Map of relevant function definitions from the hook for it's configuration on the wizard. All public/external functions must be included
 * in order to automatically get the `whenNotPaused` modifier added to them.
 * @property disabledFunctions - Hook functions that are disabled in the hook, so that the {Pausable} option doesn't add the `whenNotPaused` modifier to them.
 * i.e, `BaseCustomAccounting` disables `_beforeAddLiquidity` and `_beforeRemoveLiquidity`, and therefore they don't require pausability.
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
  BaseOracleHook,
  OracleHookWithV3Adapters,
} as const;

export type HookName = keyof typeof HOOKS;
export const HooksNames = Object.keys(HOOKS) as [HookName, ...HookName[]];
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

export const ShareOptions = ['ERC20', 'ERC6909', 'ERC1155'] as const;
export type ShareOption = (typeof ShareOptions)[number];
/**
 * @property options - The type of shares to use
 * @property name - The name of the shares
 * @property symbol - The symbol of the shares
 * @property uri - The URI of the shares
 */
export type Shares = {
  options: false | ShareOption;
  name?: string;
  symbol?: string;
  uri?: string;
};

/**
 * @description Determines if the hook share type compatibility is specific and cannot be changed by the user
 * @param sharesConfig - The type of shares to use
 * @returns True if the shares type is ERC20, ERC6909, or ERC1155
 */
export function specificSharesType(sharesConfig?: SharesConfig): boolean {
  return sharesConfig === 'ERC20' || sharesConfig === 'ERC6909' || sharesConfig === 'ERC1155';
}

export type SharesConfig = 'required' | 'optional' | 'disabled' | ShareOption;

/**
 * @property name - The name of the input parameter in camelCase
 * @property label - The label of the input parameter in human-readable format
 * @property type - The type of the input parameter
 * @property placeholder - The placeholder of the input parameter
 * @property tooltipText - The tooltip text of the input parameter
 */
export type HookInput = {
  name: string;
  label: string;
  type: 'string' | 'number';
  placeholder?: string;
  tooltipText?: string;
};
