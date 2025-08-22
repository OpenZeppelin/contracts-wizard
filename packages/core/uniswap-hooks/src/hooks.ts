import type { BaseFunction, Contract } from '@openzeppelin/wizard/src/contract';
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

export type Permission = keyof Permissions;
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

export const permissions = Object.keys(defaults.permissions) as Permission[];

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

  setInfo(c, allOpts.info);

  addHook(c, allOpts);

  if (allOpts.access) {
    setAccessControl(c, allOpts.access);
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

  if (allOpts.pausable) {
    // Mark before-* permissions as required for pausability
    for (const permission of PAUSABLE_PERMISSIONS) {
      allOpts.permissions[permission] = true;
    }
    addPausable(c, allOpts.access, []);
    addPausableHook(c, allOpts);
  }

  addHookPermissions(c, allOpts);

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
      c.setFunctionBody([`// Implement _getAddLiquidity`], Hooks.BaseCustomAccounting.functions._getAddLiquidity!);
      c.addOverride({ name: 'BaseCustomAccounting' }, Hooks.BaseCustomAccounting.functions._getRemoveLiquidity!);
      c.setFunctionBody(
        [`// Implement _getRemoveLiquidity`],
        Hooks.BaseCustomAccounting.functions._getRemoveLiquidity!,
      );
      c.addOverride({ name: 'BaseCustomAccounting' }, Hooks.BaseCustomAccounting.functions._mint!);
      c.setFunctionBody([`// Implement _mint`], Hooks.BaseCustomAccounting.functions._mint!);
      c.addOverride({ name: 'BaseCustomAccounting' }, Hooks.BaseCustomAccounting.functions._burn!);
      c.setFunctionBody([`// Implement _burn`], Hooks.BaseCustomAccounting.functions._burn!);
      c.addImportOnly({
        name: 'BalanceDelta',
        path: `@uniswap/v4-core/src/types/BalanceDelta.sol`,
      });
      break;
    case 'BaseCustomCurve':
      c.addOverride({ name: 'BaseCustomCurve' }, Hooks.BaseCustomCurve.functions._getUnspecifiedAmount!);
      c.setFunctionBody([`// Implement _getUnspecifiedAmount`], Hooks.BaseCustomCurve.functions._getUnspecifiedAmount!);
      c.addOverride({ name: 'BaseCustomCurve' }, Hooks.BaseCustomCurve.functions._getSwapFeeAmount!);
      c.setFunctionBody([`// Implement _getSwapFeeAmount`], Hooks.BaseCustomCurve.functions._getSwapFeeAmount!);
      c.addOverride({ name: 'BaseCustomCurve' }, Hooks.BaseCustomCurve.functions._getAmountOut!);
      c.setFunctionBody([`// Implement _getAmountOut`], Hooks.BaseCustomCurve.functions._getAmountOut!);
      c.addOverride({ name: 'BaseCustomCurve' }, Hooks.BaseCustomCurve.functions._getAmountIn!);
      c.setFunctionBody([`// Implement _getAmountIn`], Hooks.BaseCustomCurve.functions._getAmountIn!);
      c.addOverride({ name: 'BaseCustomAccounting' }, Hooks.BaseCustomAccounting.functions._mint!);
      c.setFunctionBody([`// Implement _mint`], Hooks.BaseCustomAccounting.functions._mint!);
      c.addOverride({ name: 'BaseCustomAccounting' }, Hooks.BaseCustomAccounting.functions._burn!);
      c.setFunctionBody([`// Implement _burn`], Hooks.BaseCustomAccounting.functions._burn!);
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
      c.setFunctionBody([`// Implement _getFee`], Hooks.BaseDynamicFee.functions._getFee!);
      c.addOverride({ name: 'BaseDynamicFee' }, Hooks.BaseDynamicFee.functions.poke!);
      c.setFunctionBody([`// Implement poke`], Hooks.BaseDynamicFee.functions.poke!);
      c.addImportOnly({
        name: 'PoolKey',
        path: `@uniswap/v4-core/src/types/PoolKey.sol`,
      });
      break;
    case 'BaseDynamicAfterFee':
      c.addOverride({ name: 'BaseDynamicAfterFee' }, Hooks.BaseDynamicAfterFee.functions._getTargetUnspecified!);
      c.setFunctionBody(
        [`// Implement _getTargetUnspecified`],
        Hooks.BaseDynamicAfterFee.functions._getTargetUnspecified!,
      );
      c.addOverride({ name: 'BaseDynamicAfterFee' }, Hooks.BaseDynamicAfterFee.functions._afterSwapHandler!);
      c.setFunctionBody([`// Implement _afterSwapHandler`], Hooks.BaseDynamicAfterFee.functions._afterSwapHandler!);
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
      c.setFunctionBody([`// Implement _getFee`], Hooks.BaseOverrideFee.functions._getFee!);
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
      c.setFunctionBody([`// Implement _afterSwapHandler`], Hooks.AntiSandwichHook.functions._afterSwapHandler!);
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

// Makes the `before` hooks pausable by default. Requires the `before` permissions to be set to true.
function addPausableHook(c: ContractBuilder, _allOpts: HooksOptions) {
  const selectedHook = Hooks[_allOpts.hook];

  // Make elegible custom functions pausable. See {functionShouldBePausable} for criteria.
  for (const f of Object.values(selectedHook.functions)) {
    if (functionShouldBePausable(f, _allOpts)) {
      // override only if the function is not already overridden
      const contractFn = c.functions.find(fn => fn.name === f.name);
      if (!contractFn || contractFn.override.size === 0) {
        c.addOverride({ name: c.name }, f);
        c.setFunctionBody([returnSuperFunctionInvocation(f)], f);
      }
      c.addModifier('whenNotPaused', f);
    }
  }

  // Make common hook functions pausable. Note that disabled functions don't require pausability.
  const baseHookFunctions = Object.keys(Hooks.BaseHook.functions);
  for (const p of PAUSABLE_PERMISSIONS) {
    const funcName = baseHookFunctions.find(name => name.includes(p));
    if (funcName && !selectedHook.disabledFunctions?.includes(funcName)) {
      const f = Hooks.BaseHook.functions[funcName]!;
      c.addOverride({ name: 'BaseHook' }, f);
      c.setFunctionBody([returnSuperFunctionInvocation(f)], f);
      c.addModifier('whenNotPaused', f);
      // c.addFunctionImports(f)
    }
  }

  // c.addOverride({ name: 'BaseHook' }, Hooks.BaseHook.functions._beforeInitialize!);
  // c.setFunctionBody(
  //   [`return super._beforeInitialize(sender, key, sqrtPriceX96 );`],
  //   Hooks.BaseHook.functions._beforeInitialize!,
  // );
  // c.addModifier('whenNotPaused', Hooks.BaseHook.functions._beforeInitialize!);
  // c.addImportOnly({
  //   name: 'PoolKey',
  //   path: `@uniswap/v4-core/src/types/PoolKey.sol`,
  // });

  // c.addOverride({ name: 'BaseHook' }, Hooks.BaseHook.functions._beforeAddLiquidity!);
  // c.setFunctionBody(
  //   [`return super._beforeAddLiquidity(sender, key, params, hookData);`],
  //   Hooks.BaseHook.functions._beforeAddLiquidity!,
  // );
  // c.addModifier('whenNotPaused', Hooks.BaseHook.functions._beforeAddLiquidity!);
  // c.addImportOnly({
  //   name: 'ModifyLiquidityParams',
  //   path: `@uniswap/v4-core/src/types/PoolOperation.sol`,
  // });

  // c.addOverride({ name: 'BaseHook' }, Hooks.BaseHook.functions._beforeRemoveLiquidity!);
  // c.setFunctionBody(
  //   [`return super._beforeRemoveLiquidity(sender, key, params, hookData);`],
  //   Hooks.BaseHook.functions._beforeRemoveLiquidity!,
  // );
  // c.addModifier('whenNotPaused', Hooks.BaseHook.functions._beforeRemoveLiquidity!);

  // c.addOverride({ name: 'BaseHook' }, Hooks.BaseHook.functions._beforeSwap!);
  // c.setFunctionBody(
  //   [`return super._beforeSwap(sender, key, params, hookData);`],
  //   Hooks.BaseHook.functions._beforeSwap!,
  // );
  // c.addModifier('whenNotPaused', Hooks.BaseHook.functions._beforeSwap!);
  // c.addImportOnly({
  //   name: 'SwapParams',
  //   path: `@uniswap/v4-core/src/types/PoolOperation.sol`,
  // });
  // c.addImportOnly({
  //   name: 'BeforeSwapDelta',
  //   path: `@uniswap/v4-core/src/types/BeforeSwapDelta.sol`,
  // });

  // c.addOverride({ name: 'BaseHook' }, Hooks.BaseHook.functions._beforeDonate!);
  // c.setFunctionBody(
  //   [`return super._beforeDonate(sender, key, amount0, amount1, hookData);`],
  //   Hooks.BaseHook.functions._beforeDonate!,
  // );
  // c.addModifier('whenNotPaused', Hooks.BaseHook.functions._beforeDonate!);
}

function addHookPermissions(c: ContractBuilder, _allOpts: HooksOptions) {
  c.addImportOnly({
    name: 'Hooks',
    path: `@uniswap/v4-core/src/libraries/Hooks.sol`,
  });

  const permissions = Object.entries(_allOpts.permissions);
  const permissionLines = permissions.map(
    ([key, value], idx) => `    ${key}: ${value}${idx === permissions.length - 1 ? '' : ','}`,
  );
  c.addOverride({ name: 'BaseHook' }, Hooks.BaseHook.functions.getHookPermissions!);
  c.setFunctionBody(
    ['return Hooks.Permissions({', ...permissionLines, '});'],
    Hooks.BaseHook.functions.getHookPermissions!,
  );
}

function functionInvocation(f: BaseFunction): string {
  return `${f.name}(${f.args.map(arg => arg.name).join(', ')})`;
}

function returnSuperFunctionInvocation(f: BaseFunction): string {
  return `return super.${functionInvocation(f)}`;
}

// Utility to pause custom functions such as `addLiquidity` in CustomAccounting hooks.
function functionShouldBePausable(f: BaseFunction, _allOpts: HooksOptions) {
  const whitelist = ['unlockCallback', 'pause', 'unpause'];
  return (
    (f.kind === 'external' || f.kind === 'public') &&
    f.mutability !== 'pure' &&
    f.mutability !== 'view' &&
    !whitelist.includes(f.name)
  );
}
