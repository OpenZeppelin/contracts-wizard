import type { Contract } from '@openzeppelin/wizard/src/contract';
import { ContractBuilder } from '@openzeppelin/wizard/src/contract';
import type { CommonOptions } from '@openzeppelin/wizard/src/common-options';
import { withCommonDefaults, defaults as commonDefaults } from '@openzeppelin/wizard/src/common-options';
import { setInfo } from '@openzeppelin/wizard/src/set-info';
import { setAccessControl } from '@openzeppelin/wizard/src/set-access-control';
import { addPausable } from '@openzeppelin/wizard/src/add-pausable';
import { printContract } from '@openzeppelin/wizard/src/print';
import type { Value } from '@openzeppelin/wizard/src/contract';

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
  tooltipText: string;
  tooltipLink: string;
};

export const Hooks: Hook[] = [
  // Base
  {
    name: 'BaseHook',
    category: 'Base',
    tooltipText:
      'Base hook implementation providing standard entry points, permission checks, and validation utilities for building hooks.',
    tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/base#BaseHook',
  },
  {
    name: 'BaseAsyncSwap',
    category: 'Base',
    tooltipText:
      'Base implementation for asynchronous swaps that bypasses the default swap flow by netting the specified amount to zero, enabling custom execution and settlement.',
    tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/base#BaseAsyncSwap',
  },
  {
    name: 'BaseCustomAccounting',
    tooltipText:
      'Base for custom accounting and hook-owned liquidity; implement how liquidity changes are computed and how shares are minted/burned. Intended for a single pool key per instance.',
    tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/base#BaseCustomAccounting',
    category: 'Base',
  },
  {
    name: 'BaseCustomCurve',
    tooltipText:
      'Base for custom swap curves overriding default pricing; define the unspecified amount during swaps. Builds on the custom accounting base.',
    tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/base#BaseCustomCurve',
    category: 'Base',
  },
  // Fee
  {
    name: 'BaseDynamicFee',
    tooltipText:
      'Applies a dynamic LP fee via the PoolManager; lets you update the fee over time based on your own logic.',
    tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/fee#BaseDynamicFee',
    category: 'Fee',
  },
  {
    name: 'BaseOverrideFee',
    tooltipText:
      'Automatically sets a dynamic fee before each swap, computed per trade according to your fee function.',
    tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/fee#BaseOverrideFee',
    category: 'Fee',
  },
  {
    name: 'BaseDynamicAfterFee',
    tooltipText:
      'Enforces a post-swap target and captures any positive difference as a hook fee, then lets you handle or distribute it.',
    tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/fee#BaseDynamicAfterFee',
    category: 'Fee',
  },
  // General
  {
    name: 'AntiSandwichHook',
    tooltipText:
      'Sandwich‑resistant; constrains swaps to beginning‑of‑block pricing on one side to reduce intra‑block price manipulation.',
    tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/general#AntiSandwichHook',
    category: 'General',
  },
  {
    name: 'LimitOrderHook',
    tooltipText:
      'Limit orders at specific ticks; adds out‑of‑range liquidity that fills when price crosses, with cancel and withdraw support.',
    tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/general#LimitOrderHook',
    category: 'General',
  },
  {
    name: 'LiquidityPenaltyHook',
    tooltipText:
      'JIT-resistant; withholds and penalizes LP fees when liquidity is added then removed within a block window, donating penalties to in-range LPs.',
    tooltipLink: 'https://docs.openzeppelin.com/uniswap-hooks/api/general#LiquidityPenaltyHook',
    category: 'General',
  },
];

export const sharesOptions = [false, 'ERC20', 'ERC6909'] as const;
export type Shares = {
  options: (typeof sharesOptions)[number];
  name: string;
  symbol: string;
};

export interface HooksOptions extends CommonOptions {
  hook: HookName;
  name: string;
  pausable?: boolean;
  currencySettler?: boolean;
  safeCast?: boolean;
  transientStorage?: boolean;
  shares?: Shares;
}

export const defaults: Required<HooksOptions> = {
  hook: 'BaseHook',
  name: 'MyHook',
  pausable: false,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info,
  currencySettler: false,
  safeCast: false,
  transientStorage: false,
  shares: {
    options: false,
    name: 'MyShares',
    symbol: 'MSH',
  },
} as const;

function withDefaults(opts: HooksOptions): Required<HooksOptions> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    pausable: opts.pausable ?? defaults.pausable,
    currencySettler: opts.currencySettler ?? defaults.currencySettler,
    safeCast: opts.safeCast ?? defaults.safeCast,
    transientStorage: opts.transientStorage ?? defaults.transientStorage,
    shares: opts.shares ?? defaults.shares,
  };
}

export function printHooks(opts: HooksOptions = defaults): string {
  return printContract(buildHooks(opts));
}

export function isAccessControlRequired(opts: Partial<HooksOptions>): boolean {
  return !!opts.pausable;
}

export function buildHooks(opts: HooksOptions): Contract {
  const allOpts = withDefaults(opts);

  allOpts.upgradeable = false; // Upgradeability is not yet available for Hooks

  const c = new ContractBuilder(allOpts.name);

  addHook(c, allOpts);

  setInfo(c, allOpts.info);

  if (allOpts.access) {
    setAccessControl(c, allOpts.access);
  }

  if (allOpts.pausable) {
    addPausable(c, allOpts.access, []);
  }

  if (allOpts.currencySettler) {
    addCurrencySettler(c, allOpts);
  }

  if (allOpts.safeCast) {
    addSafeCast(c, allOpts);
  }

  if (allOpts.transientStorage) {
    addTransientStorage(c, allOpts);
  }

  if (allOpts.shares.options) {
    if (allOpts.shares.options === 'ERC20') {
      addERC20Shares(c, allOpts);
    }
    if (allOpts.shares.options === 'ERC6909') {
      addERC6909Shares(c, allOpts);
    }
  }

  return c;
}

function addHook(c: ContractBuilder, allOpts: HooksOptions) {
  c.addImportOnly({
    name: 'IPoolManager',
    path: `@uniswap/v4-core/contracts/interfaces/IPoolManager.sol`,
  });
  c.addConstructorArgument({ type: 'IPoolManager', name: '_poolManager' });

  const params: Value[] = [];
  params.push({ lit: '_poolManager' });

  switch (allOpts.hook) {
    case 'BaseHook':
    case 'BaseAsyncSwap':
    case 'BaseCustomAccounting':
    case 'BaseCustomCurve':
    case 'BaseDynamicFee':
    case 'BaseOverrideFee':
    case 'BaseDynamicAfterFee':
    case 'BaseHookFee':
    case 'AntiSandwichHook':
    case 'LimitOrderHook':
      break;
    case 'LiquidityPenaltyHook':
      c.addConstructorArgument({ type: 'uint48', name: '_blockNumberOffset' });
      params.push({ lit: '_blockNumberOffset' });
      break;
    default:
      throw new Error(`Unknown hook: ${allOpts.hook}`);
  }

  const hookCategory = Hooks.find(hook => hook.name === allOpts.hook)!.category;

  const hook = {
    name: allOpts.hook,
    path: `@openzeppelin/uniswap-hooks/src/${hookCategory.toLowerCase()}/${allOpts.hook}.sol`,
  };

  c.addParent(hook, params);
}

function addCurrencySettler(c: ContractBuilder, _allOpts: HooksOptions) {
  c.addUsing(
    {
      name: 'CurrencySettler',
      path: `@openzeppelin/uniswap-hooks/src/utils/CurrencySettler.sol`,
    },
    'Currency',
  );
}

function addSafeCast(c: ContractBuilder, _allOpts: HooksOptions) {
  c.addUsing(
    {
      name: 'SafeCast',
      path: `@openzeppelin/contracts/utils/math/SafeCast.sol`,
    },
    '*',
  );
}

function addTransientStorage(c: ContractBuilder, _allOpts: HooksOptions) {
  c.addUsing(
    {
      name: 'TransientSlot',
      path: `@openzeppelin/contracts/utils/TransientSlot.sol`,
    },
    'bytes32',
  );
  c.addUsing(
    {
      name: 'SlotDerivation',
      path: `@openzeppelin/contracts/utils/SlotDerivation.sol`,
    },
    'bytes32',
  );
}

function addERC20Shares(c: ContractBuilder, _allOpts: HooksOptions) {
  c.addParent(
    {
      name: 'ERC20',
      path: `@openzeppelin/contracts/token/ERC20/ERC20.sol`,
    },
    [_allOpts.shares!.name, _allOpts.shares!.symbol],
  );
}
function addERC6909Shares(c: ContractBuilder, _allOpts: HooksOptions) {
  c.addParent(
    {
      name: 'ERC6909',
      path: `@openzeppelin/contracts/token/ERC6909/draft-ERC6909.sol`,
    },
    [_allOpts.shares!.name, _allOpts.shares!.symbol],
  );
}
