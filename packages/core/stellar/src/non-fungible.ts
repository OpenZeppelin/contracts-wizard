import type { Contract } from './contract';
import { ContractBuilder } from './contract';
import type { Access } from './set-access-control';
import { requireAccessControl, setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import type { CommonContractOptions } from './common-options';
import { withCommonContractDefaults, getSelfArg } from './common-options';
import { setInfo } from './set-info';
import { OptionsError } from './error';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { toByteArray, toUint } from './utils/convert-strings';

export const defaults: Required<NonFungibleOptions> = {
  name: 'MyToken',
  symbol: 'MTK',
  burnable: false,
  enumerable: false,
  consecutive: false,
  pausable: false,
  premint: '0',
  mintable: false,
  access: commonDefaults.access, // TODO: Determine whether Access Control options should be visible in the UI before they are implemented as modules
  info: commonDefaults.info,
  // TODO: add option for Minting Strategy: sequential, non-sequential
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
  premint?: string;
  mintable?: boolean;
}

function withDefaults(opts: NonFungibleOptions): Required<NonFungibleOptions> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    consecutive: opts.consecutive ?? defaults.consecutive,
    enumerable: opts.enumerable ?? defaults.enumerable,
    pausable: opts.pausable ?? defaults.pausable,
    premint: opts.premint || defaults.premint,
    mintable: opts.mintable ?? defaults.mintable,
  };
}

export function buildNonFungible(opts: NonFungibleOptions): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  addBase(c, toByteArray(allOpts.name), toByteArray(allOpts.symbol), allOpts.pausable);

  if (allOpts.premint) {
    addPremint(c, allOpts.premint);
  }

  if (allOpts.pausable) {
    addPausable(c, allOpts.access);
  }

  if (allOpts.burnable) {
    addBurnable(c, allOpts.pausable);
  }

  if (allOpts.enumerable) {
    addEnumerable(c, allOpts.enumerable);
  }

  if (allOpts.consecutive) {
    addConsecutive(c, allOpts.consecutive);
  }

  if (allOpts.mintable) {
    addMintable(c, allOpts.access, allOpts.pausable);
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
  c.addUseClause('openzeppelin_non_fungible_token', 'self', { alias: 'non_fungible' });
  c.addUseClause('openzeppelin_non_fungible_token', 'NonFungibleToken');
  c.addUseClause('soroban_sdk', 'contract');
  c.addUseClause('soroban_sdk', 'contractimpl');
  c.addUseClause('soroban_sdk', 'Address');
  c.addUseClause('soroban_sdk', 'String');
  c.addUseClause('soroban_sdk', 'Env');
  c.addUseClause('soroban_sdk', 'Symbol');

  const nonFungibleTokenTrait = {
    name: 'NonFungibleToken',
    for: c.name,
    tags: ['contractimpl'],
  };

  c.addFunction(nonFungibleTokenTrait, functions.balance);
  c.addFunction(nonFungibleTokenTrait, functions.owner_of);
  c.addFunction(nonFungibleTokenTrait, functions.transfer);
  c.addFunction(nonFungibleTokenTrait, functions.transfer_from);
  c.addFunction(nonFungibleTokenTrait, functions.approve);
  c.addFunction(nonFungibleTokenTrait, functions.approve_for_all);
  c.addFunction(nonFungibleTokenTrait, functions.get_approved);
  c.addFunction(nonFungibleTokenTrait, functions.is_approved_for_all);
  c.addFunction(nonFungibleTokenTrait, functions.name);
  c.addFunction(nonFungibleTokenTrait, functions.symbol);
  c.addFunction(nonFungibleTokenTrait, functions.token_uri);

  if (pausable) {
    c.addUseClause('openzeppelin_pausable_macros', 'when_not_paused');
    c.addFunctionTag(nonFungibleTokenTrait, functions.transfer, 'when_not_paused');
    c.addFunctionTag(nonFungibleTokenTrait, functions.transfer_from, 'when_not_paused');
  }
}

function addBurnable(c: ContractBuilder, pausable: boolean) {
  c.addUseClause('openzeppelin_non_fungible_token', 'burnable::NonFungibleBurnable');
  c.addUseClause('soroban_sdk', 'Address');

  const nonFungibleBurnableTrait = {
    name: 'NonFungibleBurnable',
    for: c.name,
    tags: ['contractimpl'],
    section: 'Extensions',
  };

  c.addFunction(nonFungibleBurnableTrait, functions.burn);
  c.addFunction(nonFungibleBurnableTrait, functions.burn_from);

  if (pausable) {
    c.addUseClause('openzeppelin_pausable_macros', 'when_not_paused');
    c.addFunctionTag(nonFungibleBurnableTrait, functions.burn, 'when_not_paused');
    c.addFunctionTag(nonFungibleBurnableTrait, functions.burn_from, 'when_not_paused');
  }
}

export const premintPattern = /^(\d*\.?\d*)$/;

function addPremint(c: ContractBuilder, amount: string) {
  if (amount !== undefined && amount !== '0') {
    if (!premintPattern.test(amount)) {
      throw new OptionsError({
        premint: 'Not a valid number',
      });
    }

    // TODO: handle signed int?
    const premintAbsolute = toUint(amount, 'premint', 'u32');

    c.addUseClause('openzeppelin_non_fungible_token', 'mintable::NonFungibleMintable');
    c.addUseClause('soroban_sdk', 'Address');

    c.addConstructorArgument({ name: 'recipient', type: 'Address' });
    c.addConstructorCode(`non_fungible::mintable::mint(e, &recipient, ${premintAbsolute});`);
  }
}

// TODO: since `mint` is not related to a trait, `addFunctionTag` is not compatible with it
// we may get around this by merging the required `when_not_paused` tag into the `mint` function variants
// and storing the merged string in a variable, then using that variable in the `addConstructorCode` call
// but this is not ideal.
function addMintable(c: ContractBuilder, access: Access, pausable: boolean, sequential: boolean) {
  c.addUseClause('openzeppelin_non_fungible_token', 'mintable::NonFungibleMintable');

  if (sequential) {
    c.addUseClause('openzeppelin_non_fungible_token', 'mintable::sequential::NonFungibleMintableSequential');
    c.addConstructorCode(functions.sequential_mint);
    if (pausable) {
      c.addFunctionTag(/* ?? */, functions.mint, 'when_not_paused');
    }
  } else {
    c.addUseClause('openzeppelin_non_fungible_token', 'mintable::non_sequential::NonFungibleMintableNonSequential');
    c.addConstructorCode(functions.mint);
    if (pausable) {
      c.addFunctionTag(/* ?? */, functions.mint, 'when_not_paused');
    }
  }
}

const functions = defineFunctions({
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
    args: [
      getSelfArg(),
      { name: 'owner', type: 'Address', },
      { name: 'operator', type: 'Address' },
    ],
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
    code: ['Self::ContractType::mint(e, &account, token_id);'], // TODO: unify `mint` name in Stellar-Contracts across extensions
  },
  sequential_mint: {
    args: [getSelfArg(), { name: 'to', type: 'Address' }],
    code: ['Self::ContractType::sequential_mint(e, &account);'],
  },

  /* Extensions */

  // Burnable Trait
  burn: {
    args: [getSelfArg(), { name: 'from', type: 'Address' }, { name: 'token_id', type: 'u32' }],
    code: ['non_fungible::Base::burn(e, &from, token_id)'],
  },
  burn_from: {
    args: [
      getSelfArg(),
      { name: 'spender', type: 'Address' },
      { name: 'from', type: 'Address' },
      { name: 'token_id', type: 'u32' },
    ],
    code: ['non_fungible::Base::burn_from(e, &spender, &from, token_id)'],
  },

  // Enumerable Trait
  total_supply: {
    args: [getSelfArg()],
    returns: 'u32',
    code: ['non_fungible::enumerable::Enumerable::total_supply(e)'],
  },
  get_owner_token_id: {
    args: [getSelfArg(), {name: 'owner', type: 'Address'}, { name: 'index', type: 'u32' }],
    returns: 'u32',
    code: ['non_fungible::enumerable::Enumerable::get_owner_token_id(e, &owner, index)'],
  },
  get_token_id: {
    args: [getSelfArg(), { name: 'index', type: 'u32' }],
    returns: 'u32',
    code: ['non_fungible::enumerable::Enumerable::get_token_id(e, index)'],
  },
  mint: {
    args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'token_id', type: 'u32' }],
    code: ['non_fungible::enumerable::Enumerable::mint(e, &account, token_id);'], // TODO: unify `mint` name in Stellar-Contracts across extensions
  },
  sequential_mint: {
    args: [getSelfArg(), { name: 'to', type: 'Address' }],
    code: ['non_fungible::enumerable::Enumerable::sequential_mint(e, &account);'],
  },
  burn: {
    args: [getSelfArg(), { name: 'from', type: 'Address' }, { name: 'token_id', type: 'u32' }],
    code: ['non_fungible::enumerable::Enumerable::burn(e, &from, token_id)'],
  },
  burn_from: {
    args: [
      getSelfArg(),
      { name: 'spender', type: 'Address' },
      { name: 'from', type: 'Address' },
      { name: 'token_id', type: 'u32' },
    ],
    code: ['non_fungible::enumerable::Enumerable::burn_from(e, &spender, &from, token_id)'],
  },

  // Consecutive Trait
  batch_mint: {
    args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'amount', type: 'u32' }],
    returns: 'u32',
    code: ['non_fungible::consecutive::Consecutive::batch_mint(e, &account, amount);'],
  },
  burn: {
    args: [getSelfArg(), { name: 'from', type: 'Address' }, { name: 'token_id', type: 'u32' }],
    code: ['non_fungible::consecutive::Consecutive::burn(e, &from, token_id)'],
  },
  burn_from: {
    args: [
      getSelfArg(),
      { name: 'spender', type: 'Address' },
      { name: 'from', type: 'Address' },
      { name: 'token_id', type: 'u32' },
    ],
    code: ['non_fungible::consecutive::Consecutive::burn_from(e, &spender, &from, token_id)'],
  },
  set_owner_for: {
    args: [
      getSelfArg(),
      { name: 'to', type: 'Address' },
      { name: 'token_id', type: 'u32' },
    ],
    code: ['non_fungible::consecutive::Consecutive::set_owner_for(e, &to, token_id);'],
  }
});
