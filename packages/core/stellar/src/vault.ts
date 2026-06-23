import { ContractBuilder } from './contract';
import type { Access } from './set-access-control';
import { setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { addUpgradeable } from './add-upgradeable';
import { defineFunctions } from './utils/define-functions';
import type { CommonContractOptions } from './common-options';
import { withCommonContractDefaults, getSelfArg } from './common-options';
import { setInfo } from './set-info';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { toByteArray } from './utils/convert-strings';
import { pickKeys } from '@openzeppelin/wizard-common';

export const defaults: Required<VaultOptions> = {
  name: 'MyVault',
  symbol: 'MTK',
  pausable: false,
  upgradeable: false,
  access: commonDefaults.access,
  info: commonDefaults.info,
  explicitImplementations: commonDefaults.explicitImplementations,
} as const;

export function printVault(opts: VaultOptions = defaults): string {
  return printContract(buildVault(opts));
}

export interface VaultOptions extends CommonContractOptions {
  name: string;
  symbol: string;
  pausable?: boolean;
  upgradeable?: boolean;
}

export function withDefaults(opts: VaultOptions): Required<VaultOptions> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    pausable: opts.pausable ?? defaults.pausable,
    upgradeable: opts.upgradeable ?? defaults.upgradeable,
  };
}

export function isAccessControlRequired(opts: Partial<VaultOptions>): boolean {
  return opts.pausable === true || opts.upgradeable === true;
}

export function buildVault(opts: VaultOptions): ContractBuilder {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  addBase(c, toByteArray(allOpts.name), toByteArray(allOpts.symbol), allOpts.pausable, allOpts.explicitImplementations);

  if (allOpts.pausable) {
    addPausable(c, allOpts.access, allOpts.explicitImplementations);
  }

  if (allOpts.upgradeable) {
    addUpgradeable(c, allOpts.access, allOpts.explicitImplementations);
  }

  setAccessControl(c, allOpts.access, allOpts.explicitImplementations);

  // The AccessControl trait surface (e.g. `get_existing_roles`, role lookups)
  // references `Symbol` and `Vec`, which the contracttrait macro and explicit
  // implementations need in scope even when no function is role-gated.
  if (allOpts.access === 'roles') {
    c.addUseClause('soroban_sdk', 'Symbol');
    c.addUseClause('soroban_sdk', 'Vec');
  }

  setInfo(c, allOpts.info);

  return c;
}

function addBase(c: ContractBuilder, name: string, symbol: string, pausable: boolean, explicitImplementations: boolean) {
  // Configure the underlying asset and virtual decimals offset, then set the
  // metadata. The decimals offset must be set before metadata initialization
  // because the vault derives its decimals from the underlying asset + offset.
  c.addConstructorArgument({ name: 'asset', type: 'Address' });
  c.addConstructorArgument({ name: 'decimals_offset', type: 'u32' });
  c.addConstructorCode('Vault::set_asset(e, asset);');
  c.addConstructorCode('Vault::set_decimals_offset(e, decimals_offset);');
  c.addConstructorCode(
    `Base::set_metadata(e, Self::decimals(e), String::from_str(e, "${name}"), String::from_str(e, "${symbol}"));`,
  );

  // Set token functions
  c.addUseClause('stellar_tokens::fungible', 'Base');
  c.addUseClause('stellar_tokens::fungible', 'FungibleToken');
  c.addUseClause('stellar_tokens::vault', 'FungibleVault');
  c.addUseClause('stellar_tokens::vault', 'Vault');
  // The base token functions we emit delegate to `Self::ContractType::...`,
  // which resolve through the `ContractOverrides` trait that `Vault` implements,
  // so it must be in scope. This happens with explicit implementations (all
  // functions are spelled out) and when pausable adds transfer overrides.
  if (explicitImplementations || pausable) c.addUseClause('stellar_tokens::fungible', 'ContractOverrides');
  c.addUseClause('soroban_sdk', 'contract');
  c.addUseClause('soroban_sdk', 'contractimpl');
  c.addUseClause('soroban_sdk', 'String');
  c.addUseClause('soroban_sdk', 'Env');
  c.addUseClause('soroban_sdk', 'Address');
  c.addUseClause('soroban_sdk', 'MuxedAddress');

  const fungibleTokenTrait = {
    traitName: 'FungibleToken',
    structName: c.name,
    tags: explicitImplementations ? ['contractimpl'] : ['contractimpl(contracttrait)'],
    assocType: 'type ContractType = Vault;',
  };

  c.addTraitImplBlock(fungibleTokenTrait);

  if (explicitImplementations) {
    c.addTraitForEachFunctions(fungibleTokenTrait, fungibleTokenTraitFunctions);
  } else {
    // The vault overrides decimals to derive them from the underlying asset and
    // the virtual decimals offset.
    c.addTraitFunction(fungibleTokenTrait, functions.decimals);
  }

  if (pausable) {
    c.addUseClause('stellar_macros', 'when_not_paused');

    c.addTraitFunction(fungibleTokenTrait, functions.transfer);
    c.addFunctionTag(functions.transfer, 'when_not_paused', fungibleTokenTrait);

    c.addTraitFunction(fungibleTokenTrait, functions.transfer_from);
    c.addFunctionTag(functions.transfer_from, 'when_not_paused', fungibleTokenTrait);
  }

  const fungibleVaultTrait = {
    traitName: 'FungibleVault',
    structName: c.name,
    tags: explicitImplementations ? ['contractimpl'] : ['contractimpl(contracttrait)'],
    section: 'Extensions',
  };

  if (explicitImplementations) {
    c.addTraitForEachFunctions(fungibleVaultTrait, fungibleVaultTraitFunctions);
  } else {
    c.addTraitImplBlock(fungibleVaultTrait);
  }
}

export const functions = defineFunctions({
  // FungibleToken Trait
  total_supply: {
    args: [getSelfArg()],
    returns: 'i128',
    code: ['Self::ContractType::total_supply(e)'],
  },
  balance: {
    args: [getSelfArg(), { name: 'account', type: 'Address' }],
    returns: 'i128',
    code: ['Self::ContractType::balance(e, &account)'],
  },
  allowance: {
    args: [getSelfArg(), { name: 'owner', type: 'Address' }, { name: 'spender', type: 'Address' }],
    returns: 'i128',
    code: ['Self::ContractType::allowance(e, &owner, &spender)'],
  },
  transfer: {
    args: [
      getSelfArg(),
      { name: 'from', type: 'Address' },
      { name: 'to', type: 'MuxedAddress' },
      { name: 'amount', type: 'i128' },
    ],
    code: ['Self::ContractType::transfer(e, &from, &to, amount)'],
  },
  transfer_from: {
    args: [
      getSelfArg(),
      { name: 'spender', type: 'Address' },
      { name: 'from', type: 'Address' },
      { name: 'to', type: 'Address' },
      { name: 'amount', type: 'i128' },
    ],
    code: ['Self::ContractType::transfer_from(e, &spender, &from, &to, amount)'],
  },
  approve: {
    args: [
      getSelfArg(),
      { name: 'owner', type: 'Address' },
      { name: 'spender', type: 'Address' },
      { name: 'amount', type: 'i128' },
      { name: 'live_until_ledger', type: 'u32' },
    ],
    code: ['Self::ContractType::approve(e, &owner, &spender, amount, live_until_ledger)'],
  },
  // The vault derives decimals from the underlying asset's decimals plus the
  // virtual offset, so it overrides the default metadata-based implementation.
  decimals: {
    args: [getSelfArg()],
    returns: 'u32',
    code: ['Vault::decimals(e)'],
  },
  name: {
    args: [getSelfArg()],
    returns: 'String',
    code: ['Self::ContractType::name(e)'],
  },
  symbol: {
    args: [getSelfArg()],
    returns: 'String',
    code: ['Self::ContractType::symbol(e)'],
  },

  // FungibleVault Trait
  query_asset: {
    args: [getSelfArg()],
    returns: 'Address',
    code: ['Self::ContractType::query_asset(e)'],
  },
  total_assets: {
    args: [getSelfArg()],
    returns: 'i128',
    code: ['Self::ContractType::total_assets(e)'],
  },
  convert_to_shares: {
    args: [getSelfArg(), { name: 'assets', type: 'i128' }],
    returns: 'i128',
    code: ['Self::ContractType::convert_to_shares(e, assets)'],
  },
  convert_to_assets: {
    args: [getSelfArg(), { name: 'shares', type: 'i128' }],
    returns: 'i128',
    code: ['Self::ContractType::convert_to_assets(e, shares)'],
  },
  max_deposit: {
    args: [getSelfArg(), { name: 'receiver', type: 'Address' }],
    returns: 'i128',
    code: ['Self::ContractType::max_deposit(e, receiver)'],
  },
  preview_deposit: {
    args: [getSelfArg(), { name: 'assets', type: 'i128' }],
    returns: 'i128',
    code: ['Self::ContractType::preview_deposit(e, assets)'],
  },
  deposit: {
    args: [
      getSelfArg(),
      { name: 'assets', type: 'i128' },
      { name: 'receiver', type: 'Address' },
      { name: 'from', type: 'Address' },
      { name: 'operator', type: 'Address' },
    ],
    returns: 'i128',
    code: ['Self::ContractType::deposit(e, assets, receiver, from, operator)'],
  },
  max_mint: {
    args: [getSelfArg(), { name: 'receiver', type: 'Address' }],
    returns: 'i128',
    code: ['Self::ContractType::max_mint(e, receiver)'],
  },
  preview_mint: {
    args: [getSelfArg(), { name: 'shares', type: 'i128' }],
    returns: 'i128',
    code: ['Self::ContractType::preview_mint(e, shares)'],
  },
  mint: {
    args: [
      getSelfArg(),
      { name: 'shares', type: 'i128' },
      { name: 'receiver', type: 'Address' },
      { name: 'from', type: 'Address' },
      { name: 'operator', type: 'Address' },
    ],
    returns: 'i128',
    code: ['Self::ContractType::mint(e, shares, receiver, from, operator)'],
  },
  max_withdraw: {
    args: [getSelfArg(), { name: 'owner', type: 'Address' }],
    returns: 'i128',
    code: ['Self::ContractType::max_withdraw(e, owner)'],
  },
  preview_withdraw: {
    args: [getSelfArg(), { name: 'assets', type: 'i128' }],
    returns: 'i128',
    code: ['Self::ContractType::preview_withdraw(e, assets)'],
  },
  withdraw: {
    args: [
      getSelfArg(),
      { name: 'assets', type: 'i128' },
      { name: 'receiver', type: 'Address' },
      { name: 'owner', type: 'Address' },
      { name: 'operator', type: 'Address' },
    ],
    returns: 'i128',
    code: ['Self::ContractType::withdraw(e, assets, receiver, owner, operator)'],
  },
  max_redeem: {
    args: [getSelfArg(), { name: 'owner', type: 'Address' }],
    returns: 'i128',
    code: ['Self::ContractType::max_redeem(e, owner)'],
  },
  preview_redeem: {
    args: [getSelfArg(), { name: 'shares', type: 'i128' }],
    returns: 'i128',
    code: ['Self::ContractType::preview_redeem(e, shares)'],
  },
  redeem: {
    args: [
      getSelfArg(),
      { name: 'shares', type: 'i128' },
      { name: 'receiver', type: 'Address' },
      { name: 'owner', type: 'Address' },
      { name: 'operator', type: 'Address' },
    ],
    returns: 'i128',
    code: ['Self::ContractType::redeem(e, shares, receiver, owner, operator)'],
  },
});

const fungibleTokenTraitFunctions = pickKeys(functions, [
  'total_supply',
  'balance',
  'allowance',
  'transfer',
  'transfer_from',
  'approve',
  'decimals',
  'name',
  'symbol',
]);

const fungibleVaultTraitFunctions = pickKeys(functions, [
  'query_asset',
  'total_assets',
  'convert_to_shares',
  'convert_to_assets',
  'max_deposit',
  'preview_deposit',
  'deposit',
  'max_mint',
  'preview_mint',
  'mint',
  'max_withdraw',
  'preview_withdraw',
  'withdraw',
  'max_redeem',
  'preview_redeem',
  'redeem',
]);
