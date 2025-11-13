import type { Contract } from './contract';
import { ContractBuilder } from './contract';
import { type Access, requireAccessControl, setAccessControl } from './set-access-control';
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
  tokenUri: 'https://www.mytoken.com',
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
  tokenUri?: string;
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
    tokenUri: opts.tokenUri ?? defaults.tokenUri,
    burnable: opts.burnable ?? defaults.burnable,
    consecutive: opts.consecutive ?? defaults.consecutive,
    enumerable: opts.enumerable ?? defaults.enumerable,
    pausable: opts.pausable ?? defaults.pausable,
    upgradeable: opts.upgradeable ?? defaults.upgradeable,
    mintable: opts.mintable ?? defaults.mintable,
    sequential: opts.sequential ?? defaults.sequential,
  };
}

export function isAccessControlRequired(opts: Partial<NonFungibleOptions>): boolean {
  return opts.mintable === true || opts.pausable === true || opts.upgradeable === true || opts.consecutive === true;
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

  addBase(c, toByteArray(allOpts.name), toByteArray(allOpts.symbol), toByteArray(allOpts.tokenUri), allOpts.pausable);

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
    addEnumerable(c);
  }

  if (allOpts.consecutive) {
    addConsecutive(c, allOpts.pausable, allOpts.access);
  }

  if (allOpts.mintable) {
    addMintable(c, allOpts.enumerable, allOpts.pausable, allOpts.sequential, allOpts.access);
  }

  setAccessControl(c, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

function addBase(c: ContractBuilder, name: string, symbol: string, tokenUri: string, pausable: boolean) {
  // Set metadata
  c.addConstructorArgument({ name: 'name', type: 'String', value: name });
  c.addConstructorArgument({ name: 'symbol', type: 'String', value: symbol });
  c.addConstructorArgument({ name: 'uri', type: 'String', value: tokenUri });
  c.addConstructorCode(`Base::set_metadata(e, uri, name, symbol);`);

  // Set token functions
  c.addUseClause('stellar_tokens::non_fungible', 'Base');
  c.addUseClause('stellar_tokens::non_fungible', 'NonFungibleToken');
  c.addUseClause('stellar_macros', 'default_impl');
  c.addUseClause('soroban_sdk', 'contract');
  c.addUseClause('soroban_sdk', 'contractimpl');
  c.addUseClause('soroban_sdk', 'String');
  c.addUseClause('soroban_sdk', 'Env');

  const nonFungibleTokenTrait = {
    traitName: 'NonFungibleToken',
    structName: c.name,
    tags: ['default_impl', 'contractimpl'],
    assocType: 'type ContractType = Base;',
  };

  c.addTraitImplBlock(nonFungibleTokenTrait);

  if (pausable) {
    c.addUseClause('stellar_macros', 'when_not_paused');

    c.addTraitFunction(nonFungibleTokenTrait, baseFunctions.transfer);
    c.addFunctionTag(baseFunctions.transfer, 'when_not_paused', nonFungibleTokenTrait);

    c.addFunctionTag(baseFunctions.transfer_from, 'when_not_paused', nonFungibleTokenTrait);
    c.addTraitFunction(nonFungibleTokenTrait, baseFunctions.transfer_from);
  }
}

function addBurnable(c: ContractBuilder, pausable: boolean) {
  c.addUseClause('stellar_tokens::non_fungible', 'burnable::NonFungibleBurnable');

  const nonFungibleBurnableTrait = {
    traitName: 'NonFungibleBurnable',
    structName: c.name,
    tags: ['contractimpl'],
    section: 'Extensions',
  };

  if (pausable) {
    c.addUseClause('stellar_macros', 'when_not_paused');

    c.addTraitFunction(nonFungibleBurnableTrait, burnableFunctions.burn);
    c.addFunctionTag(burnableFunctions.burn, 'when_not_paused', nonFungibleBurnableTrait);

    c.addTraitFunction(nonFungibleBurnableTrait, burnableFunctions.burn_from);
    c.addFunctionTag(burnableFunctions.burn_from, 'when_not_paused', nonFungibleBurnableTrait);
  } else {
    // prepend '#[default_impl]'
    nonFungibleBurnableTrait.tags.unshift('default_impl');
    c.addTraitImplBlock(nonFungibleBurnableTrait);
  }
}

function addEnumerable(c: ContractBuilder) {
  c.addUseClause('stellar_tokens::non_fungible', 'enumerable::{NonFungibleEnumerable, Enumerable}');
  c.addUseClause('stellar_macros', 'default_impl');

  const nonFungibleEnumerableTrait = {
    traitName: 'NonFungibleEnumerable',
    structName: c.name,
    tags: ['default_impl', 'contractimpl'],
    section: 'Extensions',
  };
  c.addTraitImplBlock(nonFungibleEnumerableTrait);

  c.overrideAssocType('NonFungibleToken', 'type ContractType = Enumerable;');
}

function addConsecutive(c: ContractBuilder, pausable: boolean, access: Access) {
  c.addUseClause('stellar_tokens::non_fungible', 'consecutive::{NonFungibleConsecutive, Consecutive}');
  c.addUseClause('soroban_sdk', 'Address');

  const nonFungibleConsecutiveTrait = {
    traitName: 'NonFungibleConsecutive',
    structName: c.name,
    tags: ['contractimpl'],
    section: 'Extensions',
  };

  c.addTraitImplBlock(nonFungibleConsecutiveTrait);

  c.overrideAssocType('NonFungibleToken', 'type ContractType = Consecutive;');

  const mintFn = access === 'ownable' ? consecutiveFunctions.batch_mint : consecutiveFunctions.batch_mint_with_caller;
  c.addFreeFunction(mintFn);
  if (pausable) {
    c.addFunctionTag(mintFn, 'when_not_paused');
  }

  requireAccessControl(c, undefined, mintFn, access, {
    useMacro: true,
    role: 'minter',
    caller: 'caller',
  });
}

function addMintable(c: ContractBuilder, enumerable: boolean, pausable: boolean, sequential: boolean, access: Access) {
  c.addUseClause('soroban_sdk', 'Address');
  const accessProps = { useMacro: true, role: 'minter', caller: 'caller' };

  let mintFn;

  if (enumerable) {
    if (sequential) {
      mintFn =
        access === 'ownable' ? enumerableFunctions.sequential_mint : enumerableFunctions.sequential_mint_with_caller;
    } else {
      mintFn =
        access === 'ownable'
          ? enumerableFunctions.non_sequential_mint
          : enumerableFunctions.non_sequential_mint_with_caller;
    }
  } else {
    if (sequential) {
      mintFn = access === 'ownable' ? baseFunctions.sequential_mint : baseFunctions.sequential_mint_with_caller;
    } else {
      mintFn = access === 'ownable' ? baseFunctions.mint : baseFunctions.mint_with_caller;
    }
  }

  c.addFreeFunction(mintFn);
  requireAccessControl(c, undefined, mintFn, access, accessProps);

  if (pausable) {
    c.addFunctionTag(mintFn, 'when_not_paused');
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
    code: ['Self::ContractType::transfer_from(e, &spender, &from, &to, token_id);'],
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
    args: [getSelfArg(), { name: 'token_id', type: 'u32' }],
    returns: 'String',
    code: ['Self::ContractType::token_uri(e, token_id)'],
  },

  // Mint
  mint: {
    args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'token_id', type: 'u32' }],
    code: ['Base::mint(e, &to, token_id);'],
  },
  mint_with_caller: {
    name: 'mint',
    args: [
      getSelfArg(),
      { name: 'to', type: 'Address' },
      { name: 'token_id', type: 'u32' },
      { name: 'caller', type: 'Address' },
    ],
    code: ['Base::mint(e, &to, token_id);'],
  },
  sequential_mint: {
    name: 'mint',
    args: [getSelfArg(), { name: 'to', type: 'Address' }],
    code: ['Base::sequential_mint(e, &to);'],
  },
  sequential_mint_with_caller: {
    name: 'mint',
    args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'caller', type: 'Address' }],
    code: ['Base::sequential_mint(e, &to);'],
  },
});

const burnableFunctions = defineFunctions({
  burn: {
    args: [getSelfArg(), { name: 'from', type: 'Address' }, { name: 'token_id', type: 'u32' }],
    code: ['Self::ContractType::burn(e, &from, token_id)'],
  },
  burn_from: {
    args: [
      getSelfArg(),
      { name: 'spender', type: 'Address' },
      { name: 'from', type: 'Address' },
      { name: 'token_id', type: 'u32' },
    ],
    code: ['Self::ContractType::burn_from(e, &spender, &from, token_id)'],
  },
});

const enumerableFunctions = defineFunctions({
  total_supply: {
    args: [getSelfArg()],
    returns: 'u32',
    code: ['non_fungible::enumerable::Enumerable::total_supply(e)'],
  },
  non_sequential_mint: {
    name: 'mint',
    args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'token_id', type: 'u32' }],
    code: ['Enumerable::non_sequential_mint(e, &to, token_id);'],
  },
  non_sequential_mint_with_caller: {
    name: 'mint',
    args: [
      getSelfArg(),
      { name: 'to', type: 'Address' },
      { name: 'token_id', type: 'u32' },
      { name: 'caller', type: 'Address' },
    ],
    code: ['Enumerable::non_sequential_mint(e, &to, token_id);'],
  },
  sequential_mint: {
    name: 'mint',
    args: [getSelfArg(), { name: 'to', type: 'Address' }],
    code: ['Enumerable::sequential_mint(e, &to);'],
  },
  sequential_mint_with_caller: {
    name: 'mint',
    args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'caller', type: 'Address' }],
    code: ['Enumerable::sequential_mint(e, &to);'],
  },
});

const consecutiveFunctions = defineFunctions({
  batch_mint: {
    name: 'batch_mint',
    args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'amount', type: 'u32' }],
    returns: 'u32',
    code: ['Consecutive::batch_mint(e, &to, amount);'],
  },
  batch_mint_with_caller: {
    name: 'batch_mint',
    args: [
      getSelfArg(),
      { name: 'to', type: 'Address' },
      { name: 'amount', type: 'u32' },
      { name: 'caller', type: 'Address' },
    ],
    returns: 'u32',
    code: ['Consecutive::batch_mint(e, &to, amount);'],
  },
});
