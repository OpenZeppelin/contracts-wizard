import type { Contract } from '@openzeppelin/wizard/src/contract';
import { ContractBuilder } from '@openzeppelin/wizard/src/contract';
import type { CommonOptions } from '@openzeppelin/wizard/src/common-options';
import { withCommonDefaults, defaults as commonDefaults } from '@openzeppelin/wizard/src/common-options';
import { setInfo } from '@openzeppelin/wizard/src/set-info';
import { setAccessControl } from '@openzeppelin/wizard/src/set-access-control';
import { addPausable } from '@openzeppelin/wizard/src/add-pausable';
import { printContract } from '@openzeppelin/wizard/src/print';
import type { Value } from '@openzeppelin/wizard/src/contract';

export type BaseHook = 'BaseHook' | 'BaseAsyncSwap' | 'BaseCustomAccounting' | 'BaseCustomCurve';
export type FeeHook = 'BaseDynamicFee' | 'BaseOverrideFee' | 'BaseDynamicAfterFee' | 'BaseHookFee';
export type GeneralHook = 'AntiSandwichHook' | 'LimitOrderHook' | 'LiquidityPenaltyHook';
export type Hook = BaseHook | FeeHook | GeneralHook;

export const ALL_HOOKS: Hook[] = [
  // Base
  'BaseHook',
  'BaseAsyncSwap',
  'BaseCustomAccounting',
  'BaseCustomCurve',
  // Fee
  'BaseDynamicFee',
  'BaseOverrideFee',
  'BaseDynamicAfterFee',
  'BaseHookFee',
  // General
  'AntiSandwichHook',
  'LimitOrderHook',
  'LiquidityPenaltyHook',
];

export const sharesOptions = [false, 'ERC20', 'ERC6909'] as const;

export type Shares = {
  options: (typeof sharesOptions)[number];
  name: string;
  symbol: string;
};

export interface HooksOptions extends CommonOptions {
  hook: Hook;
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

  const { access, info } = allOpts;

  addHook(c, allOpts);

  setInfo(c, info);

  if (access) {
    setAccessControl(c, access);
  }

  if (allOpts.pausable) {
    addPausable(c, access, []);
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
  let path = '';

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
      path = `@openzeppelin/uniswap-hooks/src/base/${allOpts.hook}.sol`;
      break;
    case 'BaseDynamicFee':
    case 'BaseOverrideFee':
    case 'BaseDynamicAfterFee':
    case 'BaseHookFee':
      path = `@openzeppelin/uniswap-hooks/src/fee/${allOpts.hook}.sol`;
      break;
    case 'AntiSandwichHook':
    case 'LimitOrderHook':
      path = `@openzeppelin/uniswap-hooks/src/general/${allOpts.hook}.sol`;
      break;
    case 'LiquidityPenaltyHook':
      path = `@openzeppelin/uniswap-hooks/src/general/${allOpts.hook}.sol`;
      c.addConstructorArgument({ type: 'uint48', name: '_blockNumberOffset' });
      params.push({ lit: '_blockNumberOffset' });
      break;
    default:
      throw new Error(`Unknown hook: ${allOpts.hook}`);
  }

  const hook = {
    name: allOpts.hook,
    path,
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
    '*',
  );
  c.addUsing(
    {
      name: 'SlotDerivation',
      path: `@openzeppelin/contracts/utils/SlotDerivation.sol`,
    },
    '*',
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
