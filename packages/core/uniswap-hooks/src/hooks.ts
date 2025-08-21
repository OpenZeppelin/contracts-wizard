import type { Contract } from '@openzeppelin/wizard/src/contract';
import { ContractBuilder } from '@openzeppelin/wizard/src/contract';
import type { CommonOptions } from '@openzeppelin/wizard/src/common-options';
import { withCommonDefaults, defaults as commonDefaults } from '@openzeppelin/wizard/src/common-options';
import { setInfo } from '@openzeppelin/wizard/src/set-info';
import { setAccessControl } from '@openzeppelin/wizard/src/set-access-control';
import { addPausable } from '@openzeppelin/wizard/src/add-pausable';
import type { Value } from '@openzeppelin/wizard/src/contract';
import { supportsInterface } from '@openzeppelin/wizard/src/common-functions';

import { printContract } from './print';
import { Hooks, type HookName } from './hooks/';

export type Permissions = {
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

export type Shares = {
  options: false | 'ERC20' | 'ERC6909' | 'ERC1155';
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
  permissions: Permissions;
}

export const defaults: Required<HooksOptions> = {
  hook: 'BaseHook',
  name: 'MyHook',
  pausable: false,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info,
  currencySettler: true,
  safeCast: false,
  transientStorage: false,
  shares: {
    options: false,
    name: 'MyShares',
    symbol: 'MSH',
    uri: '',
  },
  permissions: {
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
  // Add required Hook imports
  c.addImportOnly({
    name: 'IPoolManager',
    path: `@uniswap/v4-core/src/interfaces/IPoolManager.sol`,
  });
  c.addConstructorArgument({ type: 'IPoolManager', name: '_poolManager' });

  // @TODO: super calls to BaseHook are broken since it is reverting each internal hook function.
  // // If the hook is not BaseHook, inherit from it.
  // if (allOpts.hook !== 'BaseHook') {
  //   c.addParent(
  //     {
  //       name: 'BaseHook',
  //       path: `@openzeppelin/uniswap-hooks/BaseHook.sol`,
  //     },
  //     [],
  //   );
  // }

  // Add Constructor Params (default)
  const constructorParams: Value[] = [];
  constructorParams.push({ lit: '_poolManager' });

  // Add Constructor Params specific to each hook
  switch (allOpts.hook) {
    case 'LiquidityPenaltyHook':
      c.addConstructorArgument({ type: 'uint48', name: '_blockNumberOffset' });
      constructorParams.push({ lit: '_blockNumberOffset' });
      break;
    default:
      break;
  }

  // Add Parent (Hook)
  c.addParent(
    {
      name: allOpts.hook,
      path: `@openzeppelin/uniswap-hooks/${Hooks[allOpts.hook].category.toLowerCase()}/${allOpts.hook}.sol`,
    },
    constructorParams,
  );

  // Add Overrides
  switch (allOpts.hook) {
    case 'BaseCustomAccounting':
      c.addOverride({ name: 'BaseCustomAccounting' }, Hooks.BaseCustomAccounting.functions._getAddLiquidity!);
      c.setFunctionBody([`// Override _getAddLiquidity`], Hooks.BaseCustomAccounting.functions._getAddLiquidity!);
      c.addOverride({ name: 'BaseCustomAccounting' }, Hooks.BaseCustomAccounting.functions._getRemoveLiquidity!);
      c.setFunctionBody([`// Override _getRemoveLiquidity`], Hooks.BaseCustomAccounting.functions._getRemoveLiquidity!);
      c.addOverride({ name: 'BaseCustomAccounting' }, Hooks.BaseCustomAccounting.functions._mint!);
      c.setFunctionBody([`// Override _mint`], Hooks.BaseCustomAccounting.functions._mint!);
      c.addOverride({ name: 'BaseCustomAccounting' }, Hooks.BaseCustomAccounting.functions._burn!);
      c.setFunctionBody([`// Override _burn`], Hooks.BaseCustomAccounting.functions._burn!);
      c.addImportOnly({
        name: 'BalanceDelta',
        path: `@uniswap/v4-core/src/types/BalanceDelta.sol`,
      });
      break;
    case 'BaseCustomCurve':
      c.addOverride({ name: 'BaseCustomCurve' }, Hooks.BaseCustomCurve.functions._getUnspecifiedAmount!);
      c.setFunctionBody([`// Override _getUnspecifiedAmount`], Hooks.BaseCustomCurve.functions._getUnspecifiedAmount!);
      c.addOverride({ name: 'BaseCustomCurve' }, Hooks.BaseCustomCurve.functions._getSwapFeeAmount!);
      c.setFunctionBody([`// Override _getSwapFeeAmount`], Hooks.BaseCustomCurve.functions._getSwapFeeAmount!);
      c.addOverride({ name: 'BaseCustomCurve' }, Hooks.BaseCustomCurve.functions._getAmountOut!);
      c.setFunctionBody([`// Override _getAmountOut`], Hooks.BaseCustomCurve.functions._getAmountOut!);
      c.addOverride({ name: 'BaseCustomCurve' }, Hooks.BaseCustomCurve.functions._getAmountIn!);
      c.setFunctionBody([`// Override _getAmountIn`], Hooks.BaseCustomCurve.functions._getAmountIn!);
      c.addOverride({ name: 'BaseCustomAccounting' }, Hooks.BaseCustomAccounting.functions._mint!);
      c.setFunctionBody([`// Override _mint`], Hooks.BaseCustomAccounting.functions._mint!);
      c.addOverride({ name: 'BaseCustomAccounting' }, Hooks.BaseCustomAccounting.functions._burn!);
      c.setFunctionBody([`// Override _burn`], Hooks.BaseCustomAccounting.functions._burn!);
      c.addImportOnly({
        name: 'BalanceDelta',
        path: `@uniswap/v4-core/src/types/BalanceDelta.sol`,
      });
      c.addImportOnly({
        name: 'SwapParams',
        path: `@uniswap/v4-core/src/types/PoolOperation.sol`,
      });
      break;
    case 'BaseDynamicFee':
      c.addOverride({ name: 'BaseDynamicFee' }, Hooks.BaseDynamicFee.functions._getFee!);
      c.setFunctionBody([`// Override _getFee`], Hooks.BaseDynamicFee.functions._getFee!);
      c.addOverride({ name: 'BaseDynamicFee' }, Hooks.BaseDynamicFee.functions.poke!);
      c.setFunctionBody([`// Override poke`], Hooks.BaseDynamicFee.functions.poke!);
      c.addImportOnly({
        name: 'PoolKey',
        path: `@uniswap/v4-core/src/types/PoolKey.sol`,
      });
      break;
    case 'BaseDynamicAfterFee':
      c.addOverride({ name: 'BaseDynamicAfterFee' }, Hooks.BaseDynamicAfterFee.functions._getTargetUnspecified!);
      c.setFunctionBody(
        [`// Override _getTargetUnspecified`],
        Hooks.BaseDynamicAfterFee.functions._getTargetUnspecified!,
      );
      c.addOverride({ name: 'BaseDynamicAfterFee' }, Hooks.BaseDynamicAfterFee.functions._afterSwapHandler!);
      c.setFunctionBody([`// Override _afterSwapHandler`], Hooks.BaseDynamicAfterFee.functions._afterSwapHandler!);
      c.addImportOnly({
        name: 'PoolKey',
        path: `@uniswap/v4-core/src/types/PoolKey.sol`,
      });
      c.addImportOnly({
        name: 'SwapParams',
        path: `@uniswap/v4-core/src/types/PoolOperation.sol`,
      });
      c.addImportOnly({
        name: 'BalanceDelta',
        path: `@uniswap/v4-core/src/types/BalanceDelta.sol`,
      });
      break;
    case 'BaseOverrideFee':
      c.addOverride({ name: 'BaseOverrideFee' }, Hooks.BaseOverrideFee.functions._getFee!);
      c.setFunctionBody([`// Override _getFee`], Hooks.BaseOverrideFee.functions._getFee!);
      c.addImportOnly({
        name: 'PoolKey',
        path: `@uniswap/v4-core/src/types/PoolKey.sol`,
      });
      c.addImportOnly({
        name: 'SwapParams',
        path: `@uniswap/v4-core/src/types/PoolOperation.sol`,
      });
      break;
    case 'AntiSandwichHook':
      c.addOverride({ name: 'AntiSandwichHook' }, Hooks.AntiSandwichHook.functions._afterSwapHandler!);
      c.setFunctionBody([`// Override _afterSwapHandler`], Hooks.AntiSandwichHook.functions._afterSwapHandler!);
      c.addImportOnly({
        name: 'PoolKey',
        path: `@uniswap/v4-core/src/types/PoolKey.sol`,
      });
      c.addImportOnly({
        name: 'SwapParams',
        path: `@uniswap/v4-core/src/types/PoolOperation.sol`,
      });
      c.addImportOnly({
        name: 'BalanceDelta',
        path: `@uniswap/v4-core/src/types/BalanceDelta.sol`,
      });
      break;
    default:
      break;
  }

  // Add Hook Permissions
  switch (allOpts.hook) {
    // case 'BaseHook':
    // break;
    default:
      addHookPermissions(c, allOpts);
      c.addImportOnly({
        name: 'Hooks',
        path: `@uniswap/v4-core/src/libraries/Hooks.sol`,
      });
      break;
  }
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
  c.addOverride({ name: 'ERC1155' }, supportsInterface);
}

function addERC6909Shares(c: ContractBuilder, _allOpts: HooksOptions) {
  c.addParent(
    {
      name: 'ERC6909',
      path: `@openzeppelin/contracts/token/ERC6909/draft-ERC6909.sol`,
    },
    [],
  );
  c.addOverride({ name: 'ERC6909' }, supportsInterface);
}

function addHookPermissions(c: ContractBuilder, _allOpts: HooksOptions) {
  const entries = Object.entries(_allOpts.permissions);
  const permissionLines = entries.map(
    ([key, value], idx) => `    ${key}: ${value}${idx === entries.length - 1 ? '' : ','}`,
  );
  c.addOverride({ name: 'BaseHook' }, Hooks.BaseHook.functions.getHookPermissions!);
  c.setFunctionBody(
    ['return Hooks.Permissions({', ...permissionLines, '});'],
    Hooks.BaseHook.functions.getHookPermissions!,
  );
}
