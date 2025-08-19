import type { Contract } from '@openzeppelin/wizard/src/contract';
import { ContractBuilder } from '@openzeppelin/wizard/src/contract';
import type { CommonOptions } from '@openzeppelin/wizard/src/common-options';
import { withCommonDefaults, defaults as commonDefaults } from '@openzeppelin/wizard/src/common-options';
import { setInfo } from '@openzeppelin/wizard/src/set-info';
import { setAccessControl } from '@openzeppelin/wizard/src/set-access-control';
import { addPausable } from '@openzeppelin/wizard/src/add-pausable';
import { printContract } from '@openzeppelin/wizard/';
import type { Value } from '@openzeppelin/wizard/src/contract';
import { compatibleContractsSemver } from './utils/version';
import { Hooks, type HookName } from './hooks/';
import { BaseHook } from './hooks/BaseHook';

export const sharesOptions = [false, 'ERC20', 'ERC6909', 'ERC1155'] as const;
export type Shares = {
  options: (typeof sharesOptions)[number];
  name?: string;
  symbol?: string;
  uri?: string;
};

export interface HooksOptions extends CommonOptions {
  hook: HookName;
  name: string;
  pausable: boolean;
  currencySettler: boolean;
  safeCast: boolean;
  transientStorage: boolean;
  shares: Shares;
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
    uri: '',
  },
};

type Permissions = {
  beforeInitialize: boolean;
  afterInitialize: boolean;
  beforeAddLiquidity: boolean;
  beforeRemoveLiquidity: boolean;
  afterAddLiquidity: boolean;
  afterRemoveLiquidity: boolean;
  beforeSwap: boolean;
  afterSwap: boolean;
  beforeDonate: boolean;
  afterDonate: boolean;
  beforeSwapReturnDelta: boolean;
  afterSwapReturnDelta: boolean;
  afterAddLiquidityReturnDelta: boolean;
  afterRemoveLiquidityReturnDelta: boolean;
};

const defaultPermissions: Permissions = {
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
};

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
  return printContract(buildHooks(opts), { compatibleSemver: compatibleContractsSemver });
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
    if (allOpts.shares.options === 'ERC1155') {
      addERC1155Shares(c, allOpts);
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
    path: `@uniswap/v4-core/src/interfaces/IPoolManager.sol`,
  });
  c.addConstructorArgument({ type: 'IPoolManager', name: '_poolManager' });

  c.addImportOnly({
    name: 'Hooks',
    path: `@uniswap/v4-core/src/libraries/Hooks.sol`,
  });

  const params: Value[] = [];
  params.push({ lit: '_poolManager' });

  switch (allOpts.hook) {
    case 'BaseHook':
      addDefaultHookPermissions(c, allOpts);
      break;
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
    path: `@openzeppelin/uniswap-hooks/${hookCategory.toLowerCase()}/${allOpts.hook}.sol`,
  };

  c.addParent(hook, params);
}

function addCurrencySettler(c: ContractBuilder, _allOpts: HooksOptions) {
  c.addUsing(
    {
      name: 'CurrencySettler',
      path: `@openzeppelin/uniswap-hooks/utils/CurrencySettler.sol`,
    },
    'Currency',
  );
  c.addImportOnly({
    name: 'Currency',
    path: `@uniswap/v4-core/src/types/Currency.sol`,
  });
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
    [_allOpts.shares.name || '', _allOpts.shares.symbol || ''],
  );
}

function addERC1155Shares(c: ContractBuilder, _allOpts: HooksOptions) {
  c.addParent(
    {
      name: 'ERC1155',
      path: `@openzeppelin/contracts/token/ERC1155/ERC1155.sol`,
    },
    [_allOpts.shares.uri || ''],
  );
}

function addERC6909Shares(c: ContractBuilder, _allOpts: HooksOptions) {
  c.addParent(
    {
      name: 'ERC6909',
      path: `@openzeppelin/contracts/token/ERC6909/draft-ERC6909.sol`,
    },
    [],
  );
}

function addDefaultHookPermissions(c: ContractBuilder, _allOpts: HooksOptions) {
  const entries = Object.entries(defaultPermissions);
  const permissionLines = entries.map(
    ([key, value], idx) => `    ${key}: ${value}${idx === entries.length - 1 ? '' : ','}`,
  );
  c.addOverride({ name: 'BaseHook' }, BaseHook.functions.getHookPermissions!);
  c.setFunctionBody(['return Hooks.Permissions({', ...permissionLines, '});'], BaseHook.functions.getHookPermissions!);
}
