import {
  withCommonDefaults,
  commonDefaults,
  setInfo,
  setAccessControl,
  addPausable,
  supportsInterface,
  ContractBuilder,
  OptionsError,
  requireAccessControl,
} from '@openzeppelin/wizard';
import type { BaseFunction, Contract, CommonOptions, ReferencedContract } from '@openzeppelin/wizard';
import { printContract } from './print';
import { HOOKS, PERMISSIONS, PAUSABLE_PERMISSIONS } from './hooks/';
import type { HookName, Shares, Permissions, Permission } from './hooks/';
import importPaths from './importPaths.json';

export interface HooksOptions extends Omit<CommonOptions, 'upgradeable'> {
  hook: HookName;
  name: string;
  pausable: boolean;
  currencySettler: boolean;
  safeCast: boolean;
  transientStorage: boolean;
  shares: Shares;
  permissions: Permissions;
  inputs: {
    blockNumberOffset: number;
    maxAbsTickDelta: number;
  };
}

export const defaults: Required<HooksOptions> = {
  hook: 'BaseHook',
  name: 'MyHook',
  pausable: false,
  access: commonDefaults.access,
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
  inputs: {
    blockNumberOffset: 10,
    maxAbsTickDelta: 887272,
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
    permissions: opts.permissions ?? defaults.permissions,
    inputs: opts.inputs ?? defaults.inputs,
  };
}

function validateInputs(opts: Required<HooksOptions>): void {
  const errors: Record<string, string> = {};

  // Validate maxAbsTickDelta if the Oracle Hook or Oracle Hook With V3 Adapters is selected
  if (opts.hook === 'BaseOracleHook' || opts.hook === 'OracleHookWithV3Adapters') {
    const maxAbsTickDelta = opts.inputs.maxAbsTickDelta;
    if (!Number.isInteger(maxAbsTickDelta) || maxAbsTickDelta < 0 || maxAbsTickDelta > 887272) {
      errors.maxAbsTickDelta = 'Max absolute tick delta must be a positive integer between 0 and 887272.';
    }
  }

  // Validate blockNumberOffset if the liquidity penalty hook is selected
  if (opts.hook === 'LiquidityPenaltyHook') {
    const blockNumberOffset = opts.inputs.blockNumberOffset;
    if (!Number.isInteger(blockNumberOffset) || !(blockNumberOffset > 0)) {
      errors.blockNumberOffset = 'Block number offset must be a positive integer.';
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new OptionsError(errors);
  }
}

export function printHooks(opts: HooksOptions = defaults): string {
  return printContract(buildHooks(opts));
}

export function buildHooks(opts: HooksOptions): Contract {
  const allOpts = withDefaults(opts);

  // Validate inputs
  validateInputs(allOpts);

  const c = new ContractBuilder(allOpts.name);

  const selectedHook = HOOKS[allOpts.hook];

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

  // Automatically preset the shares options based on the hook's shares type pre-configuration.
  switch (selectedHook.shares) {
    case 'disabled':
      allOpts.shares.options = false;
      break;
    case 'required':
      // Select the ERC20 shares by default when any share type is required
      if (!allOpts.shares.options) allOpts.shares.options = 'ERC20';
      break;
    // Select the specific shares types options when they're specifically required by the hook
    case 'ERC20':
      allOpts.shares.options = 'ERC20';
      break;
    case 'ERC6909':
      allOpts.shares.options = 'ERC6909';
      break;
    case 'ERC1155':
      allOpts.shares.options = 'ERC1155';
      break;
    case 'optional':
    default:
      break;
  }

  // Add the shares based on the shares options.
  switch (allOpts.shares.options) {
    case 'ERC20':
      addERC20Shares(c, allOpts);
      break;
    case 'ERC6909':
      addERC6909Shares(c, allOpts);
      break;
    case 'ERC1155':
      addERC1155Shares(c, allOpts);
      break;
  }

  // Add required permissions given the current options.
  for (const permission of PERMISSIONS) {
    if (
      permissionRequiredByHook(allOpts.hook, permission) ||
      permissionRequiredByAnotherPermission(allOpts, permission) ||
      (allOpts.pausable && permissionRequiredByPausable(allOpts, permission))
    ) {
      allOpts.permissions[permission] = true;
    }
  }

  if (allOpts.pausable) {
    addPausable(c, allOpts.access, []);
    addPausableFunctions(c, allOpts);
  }

  addAdditionalPermissionFunctions(c, allOpts);

  addGetHookPermissionsFunction(c, allOpts);

  importRequiredTypes(c);

  return c;
}

// Helper to get the import path for a hook
function getHookPath(hookName: HookName): string {
  const category = HOOKS[hookName].category;
  if (category === 'Oracles') {
    return `@openzeppelin/uniswap-hooks/oracles/panoptic/${hookName}.sol`;
  }
  return `@openzeppelin/uniswap-hooks/${category.toLowerCase()}/${hookName}.sol`;
}

function addHook(c: ContractBuilder, allOpts: HooksOptions) {
  c.addConstructorArgument({ name: '_poolManager', type: 'IPoolManager' });
  c.addConstructionOnly({ name: 'BaseHook', path: getHookPath('BaseHook') }, [{ lit: '_poolManager' }]);
  switch (allOpts.hook) {
    case 'BaseHook':
      addBaseHook(c, allOpts);
      break;
    case 'BaseAsyncSwap':
      addBaseAsyncSwap(c, allOpts);
      break;
    case 'BaseCustomAccounting':
      addBaseCustomAccounting(c, allOpts);
      break;
    case 'BaseCustomCurve':
      addBaseCustomCurve(c, allOpts);
      break;
    case 'BaseDynamicFee':
      addBaseDynamicFee(c, allOpts);
      break;
    case 'BaseOverrideFee':
      addBaseOverrideFee(c, allOpts);
      break;
    case 'BaseDynamicAfterFee':
      addBaseDynamicAfterFee(c, allOpts);
      break;
    case 'BaseHookFee':
      addBaseHookFee(c, allOpts);
      break;
    case 'AntiSandwichHook':
      addAntiSandwichHook(c, allOpts);
      break;
    case 'ReHypothecationHook':
      addReHypothecationHook(c, allOpts);
      break;
    case 'LiquidityPenaltyHook':
      addLiquidityPenaltyHook(c, allOpts);
      break;
    case 'LimitOrderHook':
      addLimitOrderHook(c, allOpts);
      break;
    case 'BaseOracleHook':
      addOracleHooks(c, allOpts);
      break;
    case 'OracleHookWithV3Adapters':
      addOracleHooks(c, allOpts);
      break;
    default:
      throw new Error(`Unknown hook: ${allOpts.hook}`);
  }
}

function addBaseHook(c: ContractBuilder, allOpts: HooksOptions): void {
  c.addParent({ name: allOpts.hook, path: getHookPath(allOpts.hook) }, [{ lit: '_poolManager' }]);
}

function addBaseAsyncSwap(c: ContractBuilder, allOpts: HooksOptions): void {
  c.addTopLevelComment(`TODO: Implement how asynchronous swaps are executed`);
  c.addTopLevelComment(`i.e. queuing swaps to be executed in batches, reordering, etc`);
  c.addParent({ name: allOpts.hook, path: getHookPath(allOpts.hook) }, []);
}

function addBaseCustomAccounting(c: ContractBuilder, allOpts: HooksOptions): void {
  c.addTopLevelComment(`TODO: Override the required functions to customize the accounting logic`);
  c.addTopLevelComment(`i.e. liquidity mining, rewarding well-behaved LPs, etc`);
  c.addOverride({ name: 'BaseCustomAccounting' }, HOOKS.BaseCustomAccounting.functions._getAddLiquidity!);
  c.setFunctionBody(
    [`// TODO: Implement how liquidity additions and minted shares are computed`],
    HOOKS.BaseCustomAccounting.functions._getAddLiquidity!,
  );
  c.addOverride({ name: 'BaseCustomAccounting' }, HOOKS.BaseCustomAccounting.functions._getRemoveLiquidity!);
  c.setFunctionBody(
    [`// TODO: Implement how liquidity removals and burned shares are computed`],
    HOOKS.BaseCustomAccounting.functions._getRemoveLiquidity!,
  );
  c.addOverride({ name: 'BaseCustomAccounting' }, HOOKS.BaseCustomAccounting.functions._mint!);
  c.setFunctionBody([`// TODO: Implement how shares are minted`], HOOKS.BaseCustomAccounting.functions._mint!);
  c.addOverride({ name: 'BaseCustomAccounting' }, HOOKS.BaseCustomAccounting.functions._burn!);
  c.setFunctionBody([`// TODO: Implement how shares are burned`], HOOKS.BaseCustomAccounting.functions._burn!);
  c.addParent({ name: allOpts.hook, path: getHookPath(allOpts.hook) }, []);
}

function addBaseCustomCurve(c: ContractBuilder, allOpts: HooksOptions): void {
  c.addTopLevelComment(`TODO: Override the required functions to customize the pricing curve`);
  c.addTopLevelComment(`i.e. specialized pricing curves, etc`);
  c.addOverride({ name: 'BaseCustomCurve' }, HOOKS.BaseCustomCurve.functions._getUnspecifiedAmount!);
  c.setFunctionBody(
    [`// TODO: Implement how the unspecified currency amount is computed`],
    HOOKS.BaseCustomCurve.functions._getUnspecifiedAmount!,
  );
  c.addOverride({ name: 'BaseCustomCurve' }, HOOKS.BaseCustomCurve.functions._getSwapFeeAmount!);
  c.setFunctionBody(
    [`// TODO: Implement how the LPs fees amount is computed`],
    HOOKS.BaseCustomCurve.functions._getSwapFeeAmount!,
  );
  c.addOverride({ name: 'BaseCustomCurve' }, HOOKS.BaseCustomCurve.functions._getAmountOut!);
  c.setFunctionBody(
    [`// TODO: Implement how the amount out of the swap is computed`],
    HOOKS.BaseCustomCurve.functions._getAmountOut!,
  );
  c.addOverride({ name: 'BaseCustomCurve' }, HOOKS.BaseCustomCurve.functions._getAmountIn!);
  c.setFunctionBody(
    [`// TODO: Implement how the amount in of the swap is computed`],
    HOOKS.BaseCustomCurve.functions._getAmountIn!,
  );
  c.addOverride({ name: 'BaseCustomAccounting' }, HOOKS.BaseCustomAccounting.functions._mint!);
  c.setFunctionBody([`// TODO: Implement how shares are minted`], HOOKS.BaseCustomAccounting.functions._mint!);
  c.addOverride({ name: 'BaseCustomAccounting' }, HOOKS.BaseCustomAccounting.functions._burn!);
  c.setFunctionBody([`// TODO: Implement how shares are burned`], HOOKS.BaseCustomAccounting.functions._burn!);
  c.addParent({ name: allOpts.hook, path: getHookPath(allOpts.hook) }, []);
}

function addBaseDynamicFee(c: ContractBuilder, allOpts: HooksOptions): void {
  c.addTopLevelComment('TODO: Override `_getFee` to customize the LP fee for the entire pool');
  c.addTopLevelComment(`i.e. dynamic fees depending on current market conditions, etc`);
  c.addOverride({ name: 'BaseDynamicFee' }, HOOKS.BaseDynamicFee.functions._getFee!);
  c.setFunctionBody([`// TODO: Implement how the LP fee is computed`], HOOKS.BaseDynamicFee.functions._getFee!);
  c.addFunctionCode('_poke(key);', HOOKS.BaseDynamicFee.functions.poke!);
  requireAccessControl(c, HOOKS.BaseDynamicFee.functions.poke!, allOpts.access!, 'POKE', 'poker');
  c.addParent({ name: allOpts.hook, path: getHookPath(allOpts.hook) }, []);
}

function addBaseOverrideFee(c: ContractBuilder, allOpts: HooksOptions): void {
  c.addTopLevelComment('TODO: Override `_getFee` to customize the swap fee for each swap');
  c.addTopLevelComment(`i.e. dynamic fees depending on current market conditions, swap size, swap direction, etc`);
  c.addOverride({ name: 'BaseOverrideFee' }, HOOKS.BaseOverrideFee.functions._getFee!);
  c.setFunctionBody([`// TODO: Implement how the LP fee is computed`], HOOKS.BaseOverrideFee.functions._getFee!);
  c.addParent({ name: allOpts.hook, path: getHookPath(allOpts.hook) }, []);
}

function addBaseDynamicAfterFee(c: ContractBuilder, allOpts: HooksOptions): void {
  c.addTopLevelComment('TODO: Override `_getTargetUnspecified` to customize the swap outcome target');
  c.addTopLevelComment(`i.e. capture any positive difference of the swap outcome that surpasses the target`);
  c.addOverride({ name: 'BaseDynamicAfterFee' }, HOOKS.BaseDynamicAfterFee.functions._getTargetUnspecified!);
  c.setFunctionBody(
    [`// TODO: Implement how the target unspecified amount is computed`],
    HOOKS.BaseDynamicAfterFee.functions._getTargetUnspecified!,
  );
  c.addOverride({ name: 'BaseDynamicAfterFee' }, HOOKS.BaseDynamicAfterFee.functions._afterSwapHandler!);
  c.setFunctionBody(
    [`// TODO: Implement how the accumulated target penalty fees are handled after swaps`],
    HOOKS.BaseDynamicAfterFee.functions._afterSwapHandler!,
  );
  c.addParent({ name: allOpts.hook, path: getHookPath(allOpts.hook) }, []);
}

function addBaseHookFee(c: ContractBuilder, allOpts: HooksOptions): void {
  c.addTopLevelComment('TODO: Override `_getHookFee` to customize the hook fee collection for the entire pool');
  c.addTopLevelComment(`i.e. dynamic hook-owned fees depending on current market conditions, etc`);
  c.addOverride({ name: 'BaseHookFee' }, HOOKS.BaseHookFee.functions._getHookFee!);
  c.setFunctionBody([`// TODO: Implement how the Hook fee is computed`], HOOKS.BaseHookFee.functions._getHookFee!);
  c.addOverride({ name: 'BaseHookFee' }, HOOKS.BaseHookFee.functions.handleHookFees!);
  c.setFunctionBody(
    [`// TODO: Implement how the accumulated hook fees are handled`],
    HOOKS.BaseHookFee.functions.handleHookFees!,
  );
  c.addParent({ name: allOpts.hook, path: getHookPath(allOpts.hook) }, []);
}

function addAntiSandwichHook(c: ContractBuilder, allOpts: HooksOptions): void {
  c.addTopLevelComment('TODO: Override `_afterSwapHandler` to determine how accumulated penalty fees are handled');
  c.addTopLevelComment(`i.e. distributing the fees to well-behaved LPs, improving swap pricing, etc`);
  c.addOverride({ name: 'AntiSandwichHook' }, HOOKS.AntiSandwichHook.functions._afterSwapHandler!);
  c.setFunctionBody(
    [`// TODO: Implement how the accumulated penalty fees from sandwich attacks are handled after swaps`],
    HOOKS.AntiSandwichHook.functions._afterSwapHandler!,
  );
  c.addParent({ name: allOpts.hook, path: getHookPath(allOpts.hook) }, []);
}

function addReHypothecationHook(c: ContractBuilder, allOpts: HooksOptions): void {
  c.addTopLevelComment(`TODO: Override the required functions to customize the rehypothecation logic`);
  c.addTopLevelComment(
    `i.e. keeping the liquidity in a yield-bearing ERC-4626 Vault while still being available for swaps, etc`,
  );
  c.addOverride({ name: 'ReHypothecationHook' }, HOOKS.ReHypothecationHook.functions.getCurrencyYieldSource!);
  c.setFunctionBody(
    [`// TODO: Implement how the yield source address is computed for a given currency`],
    HOOKS.ReHypothecationHook.functions.getCurrencyYieldSource!,
  );
  c.addOverride({ name: 'ReHypothecationHook' }, HOOKS.ReHypothecationHook.functions._depositToYieldSource!);
  c.setFunctionBody(
    [`// TODO: Implement how a given currency is deposited to it's corresponding yield source`],
    HOOKS.ReHypothecationHook.functions._depositToYieldSource!,
  );
  c.addOverride({ name: 'ReHypothecationHook' }, HOOKS.ReHypothecationHook.functions._withdrawFromYieldSource!);
  c.setFunctionBody(
    [`// TODO: Implement how a given currency is withdrawn from it's corresponding yield source`],
    HOOKS.ReHypothecationHook.functions._withdrawFromYieldSource!,
  );
  c.addOverride({ name: 'ReHypothecationHook' }, HOOKS.ReHypothecationHook.functions._getAmountInYieldSource!);
  c.setFunctionBody(
    [`// TODO: Implement how the hook's balance of a given currency in it's corresponding yield source is obtained`],
    HOOKS.ReHypothecationHook.functions._getAmountInYieldSource!,
  );
  c.addParent({ name: allOpts.hook, path: getHookPath(allOpts.hook) }, []);
}

function addLiquidityPenaltyHook(c: ContractBuilder, allOpts: HooksOptions): void {
  c.addTopLevelComment(`TODO: Determine the block number offset for the liquidity penalty`);
  c.addTopLevelComment(
    'i.e. `10` in order to deter JIT attacks linearly for the first 10 blocks after adding liquidity',
  );
  const blockNumberOffset = allOpts.inputs?.blockNumberOffset;
  const constructorParams = [blockNumberOffset !== undefined && blockNumberOffset > 0 ? blockNumberOffset : 10];
  c.addParent({ name: allOpts.hook, path: getHookPath(allOpts.hook) }, constructorParams);
}

function addLimitOrderHook(c: ContractBuilder, allOpts: HooksOptions): void {
  c.addParent({ name: allOpts.hook, path: getHookPath(allOpts.hook) }, []);
}

function addOracleHooks(c: ContractBuilder, allOpts: HooksOptions): void {
  c.addTopLevelComment(`TODO: Determine the max absolute tick delta for the truncated oracle`);
  c.addTopLevelComment('i.e. `488` to limit tick changes per observation to an equivalent of 5% abrupt price changes');
  c.addTopLevelComment('i.e. `887272` to disable truncation and allow full tick range observations');
  const maxAbsTickDelta = allOpts.inputs?.maxAbsTickDelta;
  const constructorParams = [
    maxAbsTickDelta !== undefined && maxAbsTickDelta >= 0 && maxAbsTickDelta <= 887272 ? maxAbsTickDelta : 887272,
  ];
  c.addParent({ name: allOpts.hook, path: getHookPath(allOpts.hook) }, constructorParams);
}

export function isAccessControlRequired(opts: Partial<HooksOptions>): boolean {
  return !!opts.pausable || opts.hook === 'BaseDynamicFee';
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
  const selectedHook = HOOKS[_allOpts.hook];
  if (selectedHook.alreadyImplementsShares) {
    // add constructor params
    c.addConstructionOnly({ name: 'ERC20', path: `@openzeppelin/contracts/token/ERC20/ERC20.sol` }, [
      _allOpts.shares.name || '',
      _allOpts.shares.symbol || '',
    ]);
  } else {
    c.addParent(
      {
        name: 'ERC20',
        path: `@openzeppelin/contracts/token/ERC20/ERC20.sol`,
      },
      [_allOpts.shares.name || '', _allOpts.shares.symbol || ''],
    );
  }
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
      path: `@openzeppelin/contracts/token/ERC6909/ERC6909.sol`,
    },
    [],
  );
  c.addOverride({ name: 'ERC6909' }, supportsInterface);
}

// Makes the `before-*` hook functions pausable by adding the `whenNotPaused` modifier.
// Requires the `before-*` permissions to be set to true, which is enforced by the {buildHooks} function.
function addPausableFunctions(c: ContractBuilder, _allOpts: HooksOptions) {
  // Make custom eligible functions pausable. See {functionShouldBePausable} for eligibility criteria.
  for (const f of Object.values(HOOKS[_allOpts.hook].functions)) {
    if (functionShouldBePausable(f, _allOpts)) {
      const existingFunction = c.functions.find(fn => fn.name === f.name);
      if (!existingFunction) {
        // Function doesn't exist yet, add it with super invocation
        c.setFunctionBody([returnSuperFunctionInvocation(f)], f);
        c.addOverride({ name: c.name }, f);
      }
      c.addModifier('whenNotPaused', f);
    }
  }
}

// Adds the `getHookPermissions` required function to the hook, which returns the permissions of the hook.
function addGetHookPermissionsFunction(c: ContractBuilder, _allOpts: HooksOptions) {
  const permissionLines = PERMISSIONS.map(
    (key, idx) => `    ${key}: ${_allOpts.permissions[key] ?? false}${idx === PERMISSIONS.length - 1 ? '' : ','}`,
  );
  c.addOverride({ name: 'BaseHook' }, HOOKS.BaseHook.functions.getHookPermissions!);
  c.setFunctionBody(
    ['return Hooks.Permissions({', ...permissionLines, '});'],
    HOOKS.BaseHook.functions.getHookPermissions!,
  );
}

// Print hook permission functions associated with additionally enabled permissions.
function addAdditionalPermissionFunctions(c: ContractBuilder, _allOpts: HooksOptions) {
  // Print each enabled permission associated function that has not been printed yet.
  for (const permission of getEnabledPermissions(_allOpts)) {
    // A permission is additional if it is not required by the hook and not required by pausability
    // (It was manually enabled by the user)
    const isAdditionalPermission =
      !permissionRequiredByHook(_allOpts.hook, permission) &&
      !(_allOpts.pausable && permissionRequiredByPausable(_allOpts, permission));

    // If the permission is additional, add the permission associated function to the contract.
    if (isAdditionalPermission) {
      const functionName = `_${permission}`;
      const permissionFunction = HOOKS.BaseHook.functions[functionName]!;
      // Permissions of the type `*-ReturnDelta` doesn't have a permission associated function.
      if (!permission.includes('ReturnDelta') && !c.functions.some(f => f.name === permissionFunction?.name)) {
        c.addOverride({ name: 'BaseHook' }, permissionFunction);
        c.setFunctionBody([`// TODO: Implement _${functionName}`], permissionFunction);
      }
    }
  }
}

function returnSuperFunctionInvocation(f: BaseFunction): string {
  const call = `super.${f.name}(${f.args.map(arg => arg.name).join(', ')})`;
  return f.returns && f.returns.length > 0 ? `return ${call};` : `${call};`;
}

function functionShouldBePausable(f: BaseFunction, _allOpts: HooksOptions) {
  // Doesn't require pausability if the function is disabled in the hook.
  if (HOOKS[_allOpts.hook].disabledFunctions.includes(f.name)) return false;

  // Should be pausable if it is a pausable permission function.
  for (const p of PAUSABLE_PERMISSIONS) {
    if (f.name === `_${p}`) return true;
  }

  // Should also be pausable by default if it is a public/external non-pure/view entrypoint to the hook.
  const whitelist = ['unlockCallback', 'pause', 'unpause', 'increaseObservationCardinalityNext'];
  if (
    (f.kind === 'external' || f.kind === 'public') &&
    f.mutability !== 'pure' &&
    f.mutability !== 'view' &&
    !whitelist.includes(f.name)
  ) {
    return true;
  }

  return false;
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

    const path = importPaths[type as keyof typeof importPaths];
    if (!path) throw new Error(`Path for ${type} not found in importPaths.json`);

    // Skip parent types, they are already imported due to inheritance.
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

export function isPermissionEnabled(opts: HooksOptions, permission: Permission): boolean {
  return opts.permissions[permission];
}

export function permissionRequiredByHook(hook: HookName, permission: Permission): boolean {
  return HOOKS[hook].permissions[permission as Permission];
}

export function permissionRequiredByPausable(opts: HooksOptions, permission: Permission): boolean {
  return Boolean(opts.pausable) && PAUSABLE_PERMISSIONS.includes(permission);
}

export function returnDeltaPermissionExtension(permission: Permission): Permission {
  return permission.concat('ReturnDelta') as Permission;
}

// If permissions of the type *-ReturnDelta are enabled, the respective permission dependencies
// are also required, i.e. the beforeSwapReturnDelta permission also requires the beforeSwap permission.
export function permissionRequiredByAnotherPermission(opts: HooksOptions, permission: Permission): boolean {
  const deltaExtensionPermission = returnDeltaPermissionExtension(permission);
  return isPermissionEnabled(opts, deltaExtensionPermission);
}

export function getEnabledPermissions(opts: HooksOptions): Permission[] {
  return Object.entries(opts.permissions)
    .filter(([_, value]) => value)
    .map(([key]) => key as Permission);
}
