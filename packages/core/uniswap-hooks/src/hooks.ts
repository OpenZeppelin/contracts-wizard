import type { Contract } from '@openzeppelin/wizard/src/contract';
import { ContractBuilder } from '@openzeppelin/wizard/src/contract';
import type { CommonOptions } from '@openzeppelin/wizard/src/common-options';
import { withCommonDefaults, defaults as commonDefaults } from '@openzeppelin/wizard/src/common-options';
import { setInfo } from '@openzeppelin/wizard/src/set-info';
import { setAccessControl } from '@openzeppelin/wizard/src/set-access-control';
import { addPausable } from '@openzeppelin/wizard/src/add-pausable';
import { printContract } from '@openzeppelin/wizard/src/print';

type BaseHook = 'BaseHook' | 'BaseAsyncSwap' | 'BaseCustomAccounting' | 'BaseCustomCurve';
type FeeHook = 'BaseDynamicFee' | 'BaseOverrideFee' | 'BaseDynamicAfterFee' | 'BaseHookFee';
type GeneralHook = 'AntiSandwichHook' | 'LimitOrderHook' | 'LiquidityPenaltyHook';
type Hook = BaseHook | FeeHook | GeneralHook;

export interface HooksOptions extends CommonOptions {
  hook: Hook;
  name: string;
  pausable?: boolean;
  currencySettler?: boolean;
  safeCast?: boolean;
  transientStorage?: boolean;
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
} as const;

function withDefaults(opts: HooksOptions): Required<HooksOptions> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    pausable: opts.pausable ?? defaults.pausable,
    currencySettler: opts.currencySettler ?? defaults.currencySettler,
    safeCast: opts.safeCast ?? defaults.safeCast,
    transientStorage: opts.transientStorage ?? defaults.transientStorage,
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

  return c;
}

function addHook(c: ContractBuilder, allOpts: HooksOptions) {
  let path = '';

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
    case 'LiquidityPenaltyHook':
      path = `@openzeppelin/uniswap-hooks/src/general/${allOpts.hook}.sol`;
      break;
    default:
      throw new Error(`Unknown hook: ${allOpts.hook}`);
  }

  c.addParent({
    name: allOpts.hook,
    path,
  });
}

function addCurrencySettler(c: ContractBuilder, opts: HooksOptions) {
  c.addUsing(
    {
      name: 'CurrencySettler',
      path: `@openzeppelin/uniswap-hooks/src/utils/CurrencySettler.sol`,
    },
    'Currency',
  );
}

function addSafeCast(c: ContractBuilder, opts: HooksOptions) {
  c.addUsing(
    {
      name: 'SafeCast',
      path: `@openzeppelin/contracts/utils/math/SafeCast.sol`,
    },
    '*',
  );
}

function addTransientStorage(c: ContractBuilder, opts: HooksOptions) {
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
