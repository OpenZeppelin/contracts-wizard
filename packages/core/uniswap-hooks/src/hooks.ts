import type { BaseFunction, Contract } from '@openzeppelin/wizard/src/contract';
import { ContractBuilder } from '@openzeppelin/wizard/src/contract';
import type { CommonOptions } from '@openzeppelin/wizard/src/common-options';
import { withCommonDefaults, defaults as commonDefaults } from '@openzeppelin/wizard/src/common-options';
import { setInfo } from '@openzeppelin/wizard/src/set-info';
import { setAccessControl } from '@openzeppelin/wizard/src/set-access-control';
import { addPausable } from '@openzeppelin/wizard/src/add-pausable';
import type { Value } from '@openzeppelin/wizard/src/contract';
import { supportsInterface } from '@openzeppelin/wizard/src/common-functions';
import type { ReferencedContract } from '@openzeppelin/wizard/src/contract';

import { printContract } from './print';
import { Hooks, type Hook, type HookName } from './hooks/';

import importPaths from './importPaths.json';

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
  currencySettler: false,
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

  // If permissions of the type *-ReturnDelta are enabled, the respective permission dependencies
  // are also required, i.e. the beforeSwapReturnDelta permission also requires the beforeSwap permission.
  for (const permission of getAllPermissions(allOpts)) {
    if (permissionRequiredByAnother(allOpts, permission)) {
      allOpts.permissions[permission] = true;
    }
  }

  addHookPermissions(c, allOpts);

  // Note: `importRequiredTypes` must be called last since it depends on all other additions.
  importRequiredTypes(c);

  return c;
}

function addHook(c: ContractBuilder, allOpts: HooksOptions) {
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

  // Add default constructor params
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

  c.addParent(
    {
      name: allOpts.hook,
      path: `@openzeppelin/uniswap-hooks/${Hooks[allOpts.hook].category.toLowerCase()}/${allOpts.hook}.sol`,
    },
    constructorParams,
  );

  // Add Overrides specific to each hook
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
      break;
    case 'BaseDynamicFee':
      c.addOverride({ name: 'BaseDynamicFee' }, Hooks.BaseDynamicFee.functions._getFee!);
      c.setFunctionBody([`// Implement _getFee`], Hooks.BaseDynamicFee.functions._getFee!);
      break;
    case 'BaseDynamicAfterFee':
      c.addOverride({ name: 'BaseDynamicAfterFee' }, Hooks.BaseDynamicAfterFee.functions._getTargetUnspecified!);
      c.setFunctionBody(
        [`// Implement _getTargetUnspecified`],
        Hooks.BaseDynamicAfterFee.functions._getTargetUnspecified!,
      );
      c.addOverride({ name: 'BaseDynamicAfterFee' }, Hooks.BaseDynamicAfterFee.functions._afterSwapHandler!);
      c.setFunctionBody([`// Implement _afterSwapHandler`], Hooks.BaseDynamicAfterFee.functions._afterSwapHandler!);
      break;
    case 'BaseOverrideFee':
      c.addOverride({ name: 'BaseOverrideFee' }, Hooks.BaseOverrideFee.functions._getFee!);
      c.setFunctionBody([`// Implement _getFee`], Hooks.BaseOverrideFee.functions._getFee!);
      break;
    case 'AntiSandwichHook':
      c.addOverride({ name: 'AntiSandwichHook' }, Hooks.AntiSandwichHook.functions._afterSwapHandler!);
      c.setFunctionBody([`// Implement _afterSwapHandler`], Hooks.AntiSandwichHook.functions._afterSwapHandler!);
      break;
    default:
      break;
  }
}

function addCurrencySettler(c: ContractBuilder, _allOpts: HooksOptions) {
  c.addLibrary(
    {
      name: 'CurrencySettler',
      path: `@openzeppelin/uniswap-hooks/utils/CurrencySettler.sol`,
    },
    ['Currency'],
  );
}

function addSafeCast(c: ContractBuilder, _allOpts: HooksOptions) {
  c.addLibrary(
    {
      name: 'SafeCast',
      path: `@openzeppelin/contracts/utils/math/SafeCast.sol`,
    },
    ['*'],
  );
}

function addTransientStorage(c: ContractBuilder, _allOpts: HooksOptions) {
  c.addLibrary(
    {
      name: 'TransientSlot',
      path: `@openzeppelin/contracts/utils/TransientSlot.sol`,
    },
    ['bytes32'],
  );
  c.addLibrary(
    {
      name: 'SlotDerivation',
      path: `@openzeppelin/contracts/utils/SlotDerivation.sol`,
    },
    ['bytes32'],
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

// Makes the `before-*` hook functions pausable by adding the `whenNotPaused` modifier.
// Requires the `before-*` permissions to be set to true, which is enforced by the {buildHooks} function.
function addPausableHook(c: ContractBuilder, _allOpts: HooksOptions) {
  const selectedHook = Hooks[_allOpts.hook];

  // Make custom eligible functions pausable. See {functionShouldBePausable} for eligibility criteria.
  for (const f of Object.values(selectedHook.functions)) {
    if (functionShouldBePausable(f, _allOpts)) {
      // override only if the function is not already included or not overridden in ContractBuilder instance
      const contractFn = c.functions.find(fn => fn.name === f.name);
      if (!contractFn || contractFn.override.size === 0) {
        c.addOverride({ name: c.name }, f);
        c.setFunctionBody([returnSuperFunctionInvocation(f)], f);
      }
      c.addModifier('whenNotPaused', f);
    }
  }

  // Make common hook functions pausable. Note that disabled functions do not require pausability.
  const baseHookFunctions = Object.keys(Hooks.BaseHook.functions);
  for (const p of PAUSABLE_PERMISSIONS) {
    const funcName = baseHookFunctions.find(name => name.includes(p));
    if (funcName && !selectedHook.disabledFunctions?.includes(funcName)) {
      const f = Hooks.BaseHook.functions[funcName]!;
      c.addOverride({ name: 'BaseHook' }, f);
      c.setFunctionBody([returnSuperFunctionInvocation(f)], f);
      c.addModifier('whenNotPaused', f);
    }
  }
}

function addHookPermissions(c: ContractBuilder, _allOpts: HooksOptions) {
  const allPermissions = getAllPermissions(_allOpts);
  const enabledPermissions = getEnabledPermissions(_allOpts);
  const selectedHookPermissions = getHookPermissions(Hooks[_allOpts.hook]);
  const pausablePermissions = getPausablePermissions(_allOpts);
  const additionallySelectedPermissions = enabledPermissions.filter(
    key => !selectedHookPermissions.includes(key) && !(_allOpts.pausable && pausablePermissions.includes(key)),
  );

  // For additionally selected permissions, add the respective function to the build
  for (const key of additionallySelectedPermissions) {
    // Permissions of the type `*-ReturnDelta` doesn't require a standalone function.
    if (!key.includes('ReturnDelta')) {
      c.addOverride({ name: 'BaseHook' }, Hooks.BaseHook.functions[`_${key}`]!);
      c.setFunctionBody([`// Implement _${key}`], Hooks.BaseHook.functions[`_${key}`]!);
    }
  }

  const permissionLines = allPermissions.map(
    (key, idx) =>
      `    ${key}: ${_allOpts.permissions[key as Permission]}${idx === allPermissions.length - 1 ? '' : ','}`,
  );
  c.addOverride({ name: 'BaseHook' }, Hooks.BaseHook.functions.getHookPermissions!);
  c.setFunctionBody(
    ['return Hooks.Permissions({', ...permissionLines, '});'],
    Hooks.BaseHook.functions.getHookPermissions!,
  );
}

// Utility to return the super function invocation as a string.
function returnSuperFunctionInvocation(f: BaseFunction): string {
  return `return super.${f.name}(${f.args.map(arg => arg.name).join(', ')});`;
}

// Utility to determine if a custom function such as `addLiquidity` in CustomAccounting should be pausable.
// By default, we want to make pausable all the possible public/external entrypoints to the hook.
function functionShouldBePausable(f: BaseFunction, _allOpts: HooksOptions) {
  const whitelist = ['unlockCallback', 'pause', 'unpause'];
  return (
    (f.kind === 'external' || f.kind === 'public') &&
    f.mutability !== 'pure' &&
    f.mutability !== 'view' &&
    !whitelist.includes(f.name)
  );
}

// Import all the required types from the contract, including constructor args, libraries, functions args/returns.
function importRequiredTypes(c: ContractBuilder) {
  const requiredTypes = new Set<string>();

  for (const arg of c.constructorArgs) {
    requiredTypes.add(normalizeType(arg.type));
  }
  for (const library of c.libraries) {
    for (const type of library.usingFor) {
      requiredTypes.add(normalizeType(type));
    }
  }
  for (const f of Object.values(c.functions)) {
    for (const arg of f.args) {
      requiredTypes.add(normalizeType(arg.type));
    }
    for (const returnType of f.returns || []) {
      requiredTypes.add(normalizeType(returnType));
    }
  }
  for (const type of requiredTypes) {
    if (isNativeSolidityType(type)) continue;

    const path = importPaths[type as keyof typeof importPaths] || 'add me to importPaths.json!';
    if (path === 'parent') continue;

    c.addImportOnly({ name: type, path: path });
  }
}

// Utility to normalize the type (string | ReferencedContract) to a type string.
function normalizeType(s: string | ReferencedContract): string {
  let type = '';
  // if the type is string, return the first word until the first space.
  if (typeof s === 'string') {
    if (s.includes(' ')) {
      type = s.split(' ')[0]!;
    } else {
      type = s;
    }
    // if the type is a referenced contract, return the name.
  } else {
    type = s.name;
  }
  // if the type has a ".", return the first word until the first ".".
  if (type.includes('.')) {
    type = type.split('.')[0]!;
  }
  // Normalize array types (e.g., uint256[], Foo[2]) to their base type
  while (type.endsWith(']')) {
    const idx = type.lastIndexOf('[');
    if (idx === -1) break;
    type = type.slice(0, idx);
  }
  // Normalize address payable → address
  if (type.startsWith('address')) type = 'address';
  return type;
}

function isNativeSolidityType(type: string): boolean {
  const base = new Set(['bool', 'address', 'string', 'bytes', 'byte', 'uint', 'int', 'fixed', 'ufixed', '*']);
  if (base.has(type)) return true;

  const intMatch = type.match(/^(u?int)(\d+)$/);
  if (intMatch) {
    const bits = Number(intMatch[2]);
    return bits >= 8 && bits <= 256 && bits % 8 === 0;
  }

  if (/^bytes([1-9]|[12]\d|3[0-2])$/.test(type)) return true;

  return type.startsWith('mapping');
}

export function getAllPermissions(opts: HooksOptions): Permission[] {
  return Object.keys(opts.permissions) as Permission[];
}

function getHookPermissions(hook: Hook): Permission[] {
  return Object.entries(hook.permissions)
    .filter(([_, value]) => value)
    .map(([key]) => key as Permission);
}

export function isPermissionEnabled(opts: HooksOptions, permission: Permission): boolean {
  return opts.permissions[permission];
}

function getEnabledPermissions(opts: HooksOptions): Permission[] {
  return getAllPermissions(opts).filter(permission => isPermissionEnabled(opts, permission));
}

function getPausablePermissions(opts: HooksOptions): Permission[] {
  return getAllPermissions(opts).filter(permission => PAUSABLE_PERMISSIONS.includes(permission));
}

export function permissionRequiredByHook(hook: HookName, permission: Permission): boolean {
  return Hooks[hook].permissions[permission as Permission];
}

export function permissionRequiredByPausable(opts: HooksOptions, permission: Permission): boolean {
  return opts.pausable && PAUSABLE_PERMISSIONS.includes(permission);
}

export function returnDeltaPermissionExtension(permission: Permission): Permission {
  return permission.concat('ReturnDelta') as Permission;
}

export function permissionRequiredByAnother(opts: HooksOptions, permission: Permission): boolean {
  const deltaExtensionPermission = returnDeltaPermissionExtension(permission);
  return isPermissionEnabled(opts, deltaExtensionPermission);
}
