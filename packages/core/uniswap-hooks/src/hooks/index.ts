import type { BaseFunction } from '@openzeppelin/wizard/src/contract';

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

export type HookName =
  | 'BaseHook'
  | 'BaseAsyncSwap'
  | 'BaseCustomAccounting'
  | 'BaseCustomCurve'
  | 'BaseDynamicFee'
  | 'BaseOverrideFee'
  | 'BaseDynamicAfterFee'
  | 'BaseHookFee'
  | 'AntiSandwichHook'
  | 'LimitOrderHook'
  | 'LiquidityPenaltyHook';

export type Hook = {
  name: HookName;
  category: HookCategory;
  functions: Record<string, BaseFunction>;
  tooltipText: string;
  tooltipLink: string;
};

export const Hooks: Hook[] = [
  BaseHook,
  BaseAsyncSwap,
  BaseCustomAccounting,
  BaseCustomCurve,
  BaseDynamicFee,
  BaseOverrideFee,
  BaseDynamicAfterFee,
  AntiSandwichHook,
  LimitOrderHook,
  LiquidityPenaltyHook,
];
