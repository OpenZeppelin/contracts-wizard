import type { BaseFunction } from '@openzeppelin/wizard';

import { BaseHook } from './BaseHook';
import { BaseAsyncSwap } from './BaseAsyncSwap';
import { BaseCustomAccounting } from './BaseCustomAccounting';
import { BaseCustomCurve } from './BaseCustomCurve';
import { BaseDynamicFee } from './BaseDynamicFee';
import { BaseOverrideFee } from './BaseOverrideFee';
import { BaseDynamicAfterFee } from './BaseDynamicAfterFee';
import { AntiSandwichHook } from './AntiSandwichHook';
import { LimitOrderHook } from './LimitOrderHook';
import { LiquidityPenaltyHook } from './LiquidityPenaltyHook';

export type HookCategory = 'Base' | 'Fee' | 'General';

export type Hook = {
  name: HookName;
  displayName: string;
  category: HookCategory;
  tooltipText: string;
  tooltipLink: string;
  permissions: Permissions;
  functions: Record<string, BaseFunction>;
  disabledFunctions?: string[];
};

export const HOOKS = {
  BaseHook,
  BaseAsyncSwap,
  BaseCustomAccounting,
  BaseCustomCurve,
  BaseDynamicFee,
  BaseOverrideFee,
  BaseDynamicAfterFee,
  AntiSandwichHook,
  LiquidityPenaltyHook,
  LimitOrderHook,
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
