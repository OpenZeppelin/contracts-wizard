import type { Contract } from './contract';
import { ContractBuilder } from './contract';
import { setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { addUpgradeable } from './add-upgradeable';
import { defineFunctions } from './utils/define-functions';
import type { CommonContractOptions } from './common-options';
import { withCommonContractDefaults, getSelfArg } from './common-options';
import { setInfo } from './set-info';
import type { OptionsErrorMessages } from './error';
import { OptionsError } from './error';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { toByteArray } from './utils/convert-strings';

export const defaults: Required<NonFungibleOptions> = {
  name: 'MyToken',
  symbol: 'MTK',
  burnable: false,
  enumerable: false,
  consecutive: false,
  pausable: false,
  upgradeable: false,
  mintable: false,
  sequential: false,
  access: commonDefaults.access, // TODO: Determine whether Access Control options should be visible in the UI before they are implemented as modules
  info: commonDefaults.info,
} as const;

export function printNonFungible(opts: NonFungibleOptions = defaults): string {
  return printContract(buildNonFungible(opts));
}

export interface NonFungibleOptions extends CommonContractOptions {
  name: string;
  symbol: string;
  burnable?: boolean;
  enumerable?: boolean;
  consecutive?: boolean;
  pausable?: boolean;
  upgradeable?: boolean;
  mintable?: boolean;
  sequential?: boolean;
}

function withDefaults(opts: NonFungibleOptions): Required<NonFungibleOptions> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    consecutive: opts.consecutive ?? defaults.consecutive,
    enumerable: opts.enumerable ?? defaults.enumerable,
    pausable: opts.pausable ?? defaults.pausable,
    upgradeable: opts.upgradeable ?? defaults.upgradeable,
    mintable: opts.mintable ?? defaults.mintable,
    sequential: opts.sequential ?? defaults.sequential,
  };
}

export function buildNonFungible(opts: NonFungibleOptions): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  const errors: OptionsErrorMessages = {};

  if (allOpts.enumerable && allOpts.consecutive) {
    errors.enumerable = 'Enumerable cannot be used with Consecutive extension';
    errors.consecutive = 'Consecutive cannot be used with Enumerable extension';
  }

  if (allOpts.consecutive && allOpts.mintable) {
    errors.consecutive = 'Consecutive cannot be used with Mintable extension';
    errors.mintable = 'Mintable cannot be used with Consecutive extension';
  }

  if (allOpts.consecutive && allOpts.sequential) {
    errors.consecutive = 'Consecutive cannot be used with Sequential minting';
    errors.sequential = 'Sequential minting cannot be used with Consecutive extension';
  }

  if (Object.keys(errors).length > 0) {
    throw new OptionsError(errors);
  }

  addBase(c, toByteArray(allOpts.name), toByteArray(allOpts.symbol), allOpts.pausable);

  if (allOpts.pausable) {
    addPausable(c, allOpts.access);
  }

  if (allOpts.upgradeable) {
    addUpgradeable(c, allOpts.access);
  }

  if (allOpts.burnable) {
    addBurnable(c, allOpts.pausable);
  }

  if (allOpts.enumerable) {
    addEnumerable(c, allOpts.burnable);
  }

  if (allOpts.consecutive) {
    addConsecutive(c, allOpts.burnable, allOpts.pausable);
  }

  if (allOpts.mintable) {
    addMintable(c, allOpts.enumerable, allOpts.pausable, allOpts.sequential);
  }

  setAccessControl(c, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

function addBase(c: ContractBuilder, name: string, symbol: string, pausable: boolean) {
  // Set metadata
  c.addConstructorCode(
    `non_fungible::metadata::set_metadata(e, String::from_str(e, "www.mytoken.com"), String::from_str(e, "${name}"), String::from_str(e, "${symbol}"));`,
  );

  // Set token functions
  c.addUseClause('stellar_non_fungible', 'self', { alias: 'non_fungible' });
  c.addUseClause('stellar_non_fungible', 'NonFungibleToken');
  c.addUseClause('soroban_sdk', 'contract');
  c.addUseClause('soroban_sdk', 'contractimpl');
  c.addUseClause('soroban_sdk', 'Address');
  c.addUseClause('soroban_sdk', 'String');
  c.addUseClause('soroban_sdk', 'Env');
  c.addUseClause('soroban_sdk', 'Symbol');

  const nonFungibleTokenTrait = {
    traitName: 'NonFungibleToken',
    structName: c.name,
    tags: ['contractimpl'],
    assocType: 'type ContractType = Base;',
  };

  // all the below may be eliminated by introducing `defaultimpl` macro at `tags` above,
  // but we lose the customization for `pausable`, and so on...
  c.addTraitFunction(nonFungibleTokenTrait, baseFunctions.owner_of);
  c.addTraitFunction(nonFungibleTokenTrait, baseFunctions.transfer);
  c.addTraitFunction(nonFungibleTokenTrait, baseFunctions.transfer_from);
  c.addTraitFunction(nonFungibleTokenTrait, baseFunctions.balance);
  c.addTraitFunction(nonFungibleTokenTrait, baseFunctions.approve);
  c.addTraitFunction(nonFungibleTokenTrait, baseFunctions.approve_for_all);
  c.addTraitFunction(nonFungibleTokenTrait, baseFunctions.get_approved);
  c.addTraitFunction(nonFungibleTokenTrait, baseFunctions.is_approved_for_all);
  c.addTraitFunction(nonFungibleTokenTrait, baseFunctions.name);
  c.addTraitFunction(nonFungibleTokenTrait, baseFunctions.symbol);
  c.addTraitFunction(nonFungibleTokenTrait, baseFunctions.token_uri);

  if (pausable) {
    c.addUseClause('stellar_pausable_macros', 'when_not_paused');
    c.addFunctionTag(baseFunctions.transfer, 'when_not_paused', nonFungibleTokenTrait);
    c.addFunctionTag(baseFunctions.transfer_from, 'when_not_paused', nonFungibleTokenTrait);
  }
}

function addBurnable(c: ContractBuilder, pausable: boolean) {
  c.addUseClause('stellar_non_fungible', 'burnable::NonFungibleBurnable');
  c.addUseClause('soroban_sdk', 'Address');

  const nonFungibleBurnableTrait = {
    traitName: 'NonFungibleBurnable',
    structName: c.name,
    tags: ['contractimpl'],
    assocType: 'type ContractType = Base;',
    section: 'Extensions',
  };

  c.addTraitFunction(nonFungibleBurnableTrait, burnableFunctions.burn);
  c.addTraitFunction(nonFungibleBurnableTrait, burnableFunctions.burn_from);

  if (pausable) {
    c.addUseClause('stellar_pausable_macros', 'when_not_paused');
    c.addFunctionTag(burnableFunctions.burn, 'when_not_paused', nonFungibleBurnableTrait);
    c.addFunctionTag(burnableFunctions.burn_from, 'when_not_paused', nonFungibleBurnableTrait);
  }
}

function addEnumerable(c: ContractBuilder, burnable: boolean) {
  c.addUseClause('stellar_non_fungible', 'enumerable::{NonFungibleEnumerable, Enumerable}');
  c.addUseClause('stellar_default_impl_macro', 'default_impl');

  const nonFungibleEnumerableTrait = {
    traitName: 'NonFungibleEnumerable',
    structName: c.name,
    tags: ['defaultimpl', 'contractimpl'],
    section: 'Extensions',
  };
  c.addTraitImplBlock(nonFungibleEnumerableTrait);

  c.overrideAssocType('NonFungibleToken', 'type ContractType = Enumerable;');

  if (burnable) {
    c.overrideAssocType('NonFungibleBurnable', 'type ContractType = Enumerable;');
  }

  // Below is not required due to `defaultimpl` macro. If we require to customize the functions,
  // then we should:
  // 1. get rid of the `defaultimpl` macro form `tags` above,
  // 2. get rid of `c.addImplementedTrait(nonFungibleEnumerableTrait);` line,
  // 3. uncomment the section below:
  /*
  c.addFunction(nonFungibleEnumerableTrait, functions.total_supply);
  c.addFunction(nonFungibleEnumerableTrait, functions.get_owner_token_id);
  c.addFunction(nonFungibleEnumerableTrait, functions.get_token_id);
  */
}

function addConsecutive(c: ContractBuilder, burnable: boolean, pausable: boolean) {
  c.addUseClause('stellar_non_fungible', 'consecutive::{NonFungibleConsecutive, Consecutive}');

  const nonFungibleConsecutiveTrait = {
    traitName: 'NonFungibleConsecutive',
    structName: c.name,
    tags: ['contractimpl'],
    section: 'Extensions',
  };

  c.addTraitImplBlock(nonFungibleConsecutiveTrait);

  c.overrideAssocType('NonFungibleToken', 'type ContractType = Consecutive;');

  if (burnable) {
    c.overrideAssocType('NonFungibleBurnable', 'type ContractType = Consecutive;');
  }

  c.addFreeFunction(consecutiveFunctions.batch_mint);
  if (pausable) {
    c.addFunctionTag(consecutiveFunctions.batch_mint, 'when_not_paused');
  }

  c.addFreeFunction(consecutiveFunctions.set_owner_for);
}

function addMintable(c: ContractBuilder, enumerable: boolean, pausable: boolean, sequential: boolean) {
  if (!enumerable) {
    if (sequential) {
      c.addUseClause('stellar_non_fungible', 'Base::sequential_mint');
      c.addFreeFunction(baseFunctions.sequential_mint);
      if (pausable) {
        c.addFunctionTag(baseFunctions.sequential_mint, 'when_not_paused');
      }
    } else {
      c.addUseClause('stellar_non_fungible', 'Base::mint');
      c.addFreeFunction(baseFunctions.mint);
      if (pausable) {
        c.addFunctionTag(baseFunctions.mint, 'when_not_paused');
      }
    }
  }

  if (enumerable) {
    if (sequential) {
      c.addFreeFunction(enumerableFunctions.sequential_mint);

      if (pausable) {
        c.addFunctionTag(enumerableFunctions.sequential_mint, 'when_not_paused');
      }
    } else {
      c.addFreeFunction(enumerableFunctions.non_sequential_mint);

      if (pausable) {
        c.addFunctionTag(enumerableFunctions.non_sequential_mint, 'when_not_paused');
      }
    }
  }
}

const baseFunctions = defineFunctions({
  // NonFungible Trait
  balance: {
    args: [getSelfArg(), { name: 'owner', type: 'Address' }],
    returns: 'u32',
    code: ['Self::ContractType::balance(e, &owner)'],
  },
  owner_of: {
    args: [getSelfArg(), { name: 'token_id', type: 'u32' }],
    returns: 'Address',
    code: ['Self::ContractType::owner_of(e, token_id)'],
  },
  transfer: {
    args: [
      getSelfArg(),
      { name: 'from', type: 'Address' },
      { name: 'to', type: 'Address' },
      { name: 'token_id', type: 'u32' },
    ],
    code: ['Self::ContractType::transfer(e, &from, &to, token_id);'],
  },
  transfer_from: {
    args: [
      getSelfArg(),
      { name: 'spender', type: 'Address' },
      { name: 'from', type: 'Address' },
      { name: 'to', type: 'Address' },
      { name: 'token_id', type: 'u32' },
    ],
    code: ['Self::ContractType::transfer_from(e, &spender, &from, &to, token_id'],
  },
  approve: {
    args: [
      getSelfArg(),
      { name: 'approver', type: 'Address' },
      { name: 'approved', type: 'Address' },
      { name: 'token_id', type: 'u32' },
      { name: 'live_until_ledger', type: 'u32' },
    ],
    code: ['Self::ContractType::approve(e, &approver, &approved, token_id, live_until_ledger)'],
  },
  approve_for_all: {
    args: [
      getSelfArg(),
      { name: 'owner', type: 'Address' },
      { name: 'operator', type: 'Address' },
      { name: 'live_until_ledger', type: 'u32' },
    ],
    code: ['Self::ContractType::approve_for_all(e, &owner, &operator, live_until_ledger)'],
  },
  get_approved: {
    args: [getSelfArg(), { name: 'token_id', type: 'u32' }],
    returns: 'Option<Address>',
    code: ['Self::ContractType::get_approved(e, token_id)'],
  },
  is_approved_for_all: {
    args: [getSelfArg(), { name: 'owner', type: 'Address' }, { name: 'operator', type: 'Address' }],
    returns: 'bool',
    code: ['Self::ContractType::is_approved_for_all(e, &owner, &operator)'],
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
  token_uri: {
    args: [getSelfArg()],
    returns: 'String',
    code: ['Self::ContractType::token_uri(e, token_id)'],
  },

  // Mint
  mint: {
    args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'token_id', type: 'u32' }],
    code: ['Self::Base::mint(e, &account, token_id);'],
  },
  sequential_mint: {
    args: [getSelfArg(), { name: 'to', type: 'Address' }],
    code: ['Self::Base::sequential_mint(e, &account);'],
  },
});

const burnableFunctions = defineFunctions({
  burn: {
    args: [getSelfArg(), { name: 'from', type: 'Address' }, { name: 'token_id', type: 'u32' }],
    code: ['non_fungible::ContractType::burn(e, &from, token_id)'],
  },
  burn_from: {
    args: [
      getSelfArg(),
      { name: 'spender', type: 'Address' },
      { name: 'from', type: 'Address' },
      { name: 'token_id', type: 'u32' },
    ],
    code: ['non_fungible::ContractType::burn_from(e, &spender, &from, token_id)'],
  },
});

const enumerableFunctions = defineFunctions({
  total_supply: {
    args: [getSelfArg()],
    returns: 'u32',
    code: ['non_fungible::enumerable::Enumerable::total_supply(e)'],
  },
  get_owner_token_id: {
    args: [getSelfArg(), { name: 'owner', type: 'Address' }, { name: 'index', type: 'u32' }],
    returns: 'u32',
    code: ['non_fungible::enumerable::Enumerable::get_owner_token_id(e, &owner, index)'],
  },
  get_token_id: {
    args: [getSelfArg(), { name: 'index', type: 'u32' }],
    returns: 'u32',
    code: ['non_fungible::enumerable::Enumerable::get_token_id(e, index)'],
  },
  non_sequential_mint: {
    args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'token_id', type: 'u32' }],
    code: ['non_fungible::enumerable::Enumerable::non_sequential_mint(e, &account, token_id);'], // TODO: unify `mint` name in Stellar-Contracts across extensions
  },
  sequential_mint: {
    args: [getSelfArg(), { name: 'to', type: 'Address' }],
    code: ['non_fungible::enumerable::Enumerable::sequential_mint(e, &account);'],
  },
});

const consecutiveFunctions = defineFunctions({
  batch_mint: {
    args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'amount', type: 'u32' }],
    returns: 'u32',
    code: ['non_fungible::consecutive::Consecutive::batch_mint(e, &account, amount);'],
  },
  set_owner_for: {
    args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'token_id', type: 'u32' }],
    code: ['non_fungible::consecutive::Consecutive::set_owner_for(e, &to, token_id);'],
  },
});
