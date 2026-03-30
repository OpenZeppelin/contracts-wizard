import { pickKeys } from '@openzeppelin/wizard-common';
import { addPausable } from './add-pausable';
import { addUpgradeable } from './add-upgradeable';
import type { CommonContractOptions } from './common-options';
import { contractDefaults as commonDefaults, getSelfArg, withCommonContractDefaults } from './common-options';
import type { Contract } from './contract';
import { ContractBuilder } from './contract';
import type { OptionsErrorMessages } from './error';
import { OptionsError } from './error';
import { printContract } from './print';
import { type Access, DEFAULT_ACCESS_CONTROL, requireAccessControl, setAccessControl } from './set-access-control';
import { setInfo } from './set-info';
import { toByteArray } from './utils/convert-strings';
import { defineFunctions } from './utils/define-functions';

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
  votes: false,
  access: commonDefaults.access, // TODO: Determine whether Access Control options should be visible in the UI before they are implemented as modules
  info: commonDefaults.info,
  explicitImplementations: commonDefaults.explicitImplementations,
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
  votes?: boolean;
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
    votes: opts.votes ?? defaults.votes,
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

  if (allOpts.votes && allOpts.enumerable) {
    errors.votes = 'Votes cannot be used with Enumerable extension';
    errors.enumerable = 'Enumerable cannot be used with Votes extension';
  }

  if (allOpts.votes && allOpts.consecutive) {
    errors.votes = 'Votes cannot be used with Consecutive extension';
    errors.consecutive = 'Consecutive cannot be used with Votes extension';
  }

  if (Object.keys(errors).length > 0) {
    throw new OptionsError(errors);
  }

  addBase(
    c,
    toByteArray(allOpts.name),
    toByteArray(allOpts.symbol),
    toByteArray(allOpts.tokenUri),
    allOpts.pausable,
    allOpts.explicitImplementations,
  );

  if (allOpts.votes) {
    addNonFungibleVotes(c, allOpts.explicitImplementations);
  }

  if (allOpts.pausable) {
    addPausable(c, allOpts.access, allOpts.explicitImplementations);
  }

  if (allOpts.upgradeable) {
    addUpgradeable(c, allOpts.access, allOpts.explicitImplementations);
  }

  if (allOpts.burnable) {
    addBurnable(c, allOpts.pausable, allOpts.explicitImplementations, allOpts.votes);
  }

  if (allOpts.enumerable) {
    addEnumerable(c, allOpts.explicitImplementations);
  }

  if (allOpts.consecutive) {
    addConsecutive(c, allOpts.pausable, allOpts.access, allOpts.explicitImplementations);
  }

  if (allOpts.mintable) {
    addMintable(
      c,
      allOpts.enumerable,
      allOpts.pausable,
      allOpts.sequential,
      allOpts.access,
      allOpts.explicitImplementations,
      allOpts.votes,
    );
  }

  setAccessControl(c, allOpts.access, allOpts.explicitImplementations);
  setInfo(c, allOpts.info);

  return c;
}

function addBase(
  c: ContractBuilder,
  name: string,
  symbol: string,
  tokenUri: string,
  pausable: boolean,
  explicitImplementations: boolean,
) {
  // Set metadata
  c.addConstructorCode(`let uri = String::from_str(e, "${tokenUri}");`);
  c.addConstructorCode(`let name = String::from_str(e, "${name}");`);
  c.addConstructorCode(`let symbol = String::from_str(e, "${symbol}");`);
  c.addConstructorCode(`Base::set_metadata(e, uri, name, symbol);`);

  // Set token functions
  c.addUseClause('stellar_tokens::non_fungible', 'Base');
  c.addUseClause('stellar_tokens::non_fungible', 'NonFungibleToken');
  if (explicitImplementations) c.addUseClause('stellar_tokens::non_fungible', 'ContractOverrides');
  c.addUseClause('soroban_sdk', 'contract');
  c.addUseClause('soroban_sdk', 'contractimpl');
  c.addUseClause('soroban_sdk', 'String');
  c.addUseClause('soroban_sdk', 'Env');
  c.addUseClause('soroban_sdk', 'Address');

  const nonFungibleTokenTrait = {
    traitName: 'NonFungibleToken',
    structName: c.name,
    tags: explicitImplementations ? ['contractimpl'] : ['contractimpl(contracttrait)'],
    assocType: 'type ContractType = Base;',
  };

  c.addTraitImplBlock(nonFungibleTokenTrait);

  if (explicitImplementations) c.addTraitForEachFunctions(nonFungibleTokenTrait, nonFungibleTokenTraitFunctions);

  if (pausable) {
    c.addUseClause('stellar_macros', 'when_not_paused');

    c.addTraitFunction(nonFungibleTokenTrait, baseFunctions.transfer);
    c.addFunctionTag(baseFunctions.transfer, 'when_not_paused', nonFungibleTokenTrait);

    c.addFunctionTag(baseFunctions.transfer_from, 'when_not_paused', nonFungibleTokenTrait);
    c.addTraitFunction(nonFungibleTokenTrait, baseFunctions.transfer_from);
  }
}

function addBurnable(c: ContractBuilder, pausable: boolean, explicitImplementations: boolean, votes: boolean) {
  c.addUseClause('stellar_tokens::non_fungible', 'burnable::NonFungibleBurnable');

  const nonFungibleBurnableTrait = {
    traitName: 'NonFungibleBurnable',
    structName: c.name,
    tags: explicitImplementations ? ['contractimpl'] : ['contractimpl(contracttrait)'],
    section: 'Extensions',
  };

  const burnFn = votes ? burnableFunctions.burn_votes : burnableFunctions.burn;
  const burnFromFn = votes ? burnableFunctions.burn_from_votes : burnableFunctions.burn_from;

  if (pausable) {
    c.addUseClause('stellar_macros', 'when_not_paused');

    c.addTraitFunction(nonFungibleBurnableTrait, burnFn);
    c.addFunctionTag(burnFn, 'when_not_paused', nonFungibleBurnableTrait);

    c.addTraitFunction(nonFungibleBurnableTrait, burnFromFn);
    c.addFunctionTag(burnFromFn, 'when_not_paused', nonFungibleBurnableTrait);
  } else if (votes) {
    c.addTraitFunction(nonFungibleBurnableTrait, burnFn);
    c.addTraitFunction(nonFungibleBurnableTrait, burnFromFn);
  } else if (explicitImplementations)
    c.addTraitForEachFunctions(nonFungibleBurnableTrait, nonFungibleBurnableFunctions);
  else {
    c.addTraitImplBlock(nonFungibleBurnableTrait);
  }
}

function addEnumerable(c: ContractBuilder, explicitImplementations: boolean) {
  c.addUseClause('stellar_tokens::non_fungible', 'enumerable::{NonFungibleEnumerable, Enumerable}');

  const nonFungibleEnumerableTrait = {
    traitName: 'NonFungibleEnumerable',
    structName: c.name,
    tags: explicitImplementations ? ['contractimpl'] : ['contractimpl(contracttrait)'],
    section: 'Extensions',
  };
  if (explicitImplementations)
    c.addTraitForEachFunctions(nonFungibleEnumerableTrait, nonFungibleEnumerableTraitFunctions);
  else c.addTraitImplBlock(nonFungibleEnumerableTrait);

  c.overrideAssocType('NonFungibleToken', 'type ContractType = Enumerable;');
}

function addConsecutive(c: ContractBuilder, pausable: boolean, access: Access, explicitImplementations: boolean) {
  c.addUseClause('stellar_tokens::non_fungible', 'consecutive::{NonFungibleConsecutive, Consecutive}');

  const effectiveAccess = access === false ? DEFAULT_ACCESS_CONTROL : access;
  const nonFungibleConsecutiveTrait = {
    traitName: 'NonFungibleConsecutive',
    structName: c.name,
    tags: ['contractimpl'],
    section: 'Extensions',
  };

  c.addTraitImplBlock(nonFungibleConsecutiveTrait);

  c.overrideAssocType('NonFungibleToken', 'type ContractType = Consecutive;');

  const mintFn =
    effectiveAccess === 'ownable' ? consecutiveFunctions.batch_mint : consecutiveFunctions.batch_mint_with_caller;
  c.addFreeFunction(mintFn);
  if (pausable) {
    c.addFunctionTag(mintFn, 'when_not_paused');
  }

  requireAccessControl(
    c,
    undefined,
    mintFn,
    effectiveAccess,
    {
      useMacro: true,
      role: 'minter',
      caller: 'caller',
    },
    explicitImplementations,
  );
}

function addMintable(
  c: ContractBuilder,
  enumerable: boolean,
  pausable: boolean,
  sequential: boolean,
  access: Access,
  explicitImplementations: boolean,
  votes: boolean,
) {
  const accessProps = { useMacro: true, role: 'minter', caller: 'caller' };
  const effectiveAccess = access === false ? DEFAULT_ACCESS_CONTROL : access;

  let mintFn;

  if (enumerable) {
    if (sequential) {
      mintFn =
        effectiveAccess === 'ownable'
          ? enumerableFunctions.sequential_mint
          : enumerableFunctions.sequential_mint_with_caller;
    } else {
      mintFn =
        effectiveAccess === 'ownable'
          ? enumerableFunctions.non_sequential_mint
          : enumerableFunctions.non_sequential_mint_with_caller;
    }
  } else if (votes) {
    if (sequential) {
      mintFn =
        effectiveAccess === 'ownable'
          ? votesMintFunctions.sequential_mint
          : votesMintFunctions.sequential_mint_with_caller;
    } else {
      mintFn = effectiveAccess === 'ownable' ? votesMintFunctions.mint : votesMintFunctions.mint_with_caller;
    }
  } else {
    if (sequential) {
      mintFn =
        effectiveAccess === 'ownable' ? baseFunctions.sequential_mint : baseFunctions.sequential_mint_with_caller;
    } else {
      mintFn = effectiveAccess === 'ownable' ? baseFunctions.mint : baseFunctions.mint_with_caller;
    }
  }

  c.addFreeFunction(mintFn);
  requireAccessControl(c, undefined, mintFn, effectiveAccess, accessProps, explicitImplementations);

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

const nonFungibleTokenTraitFunctions = pickKeys(baseFunctions, [
  'balance',
  'owner_of',
  'transfer',
  'transfer_from',
  'approve',
  'approve_for_all',
  'get_approved',
  'is_approved_for_all',
  'name',
  'symbol',
  'token_uri',
]);

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
  burn_votes: {
    name: 'burn',
    args: [getSelfArg(), { name: 'from', type: 'Address' }, { name: 'token_id', type: 'u32' }],
    code: ['NonFungibleVotes::burn(e, &from, token_id)'],
  },
  burn_from_votes: {
    name: 'burn_from',
    args: [
      getSelfArg(),
      { name: 'spender', type: 'Address' },
      { name: 'from', type: 'Address' },
      { name: 'token_id', type: 'u32' },
    ],
    code: ['NonFungibleVotes::burn_from(e, &spender, &from, token_id)'],
  },
});

const nonFungibleBurnableFunctions = pickKeys(burnableFunctions, ['burn', 'burn_from']);

const enumerableFunctions = defineFunctions({
  total_supply: {
    args: [getSelfArg()],
    returns: 'u32',
    code: ['Enumerable::total_supply(e)'],
  },
  get_owner_token_id: {
    args: [getSelfArg(), { name: 'owner', type: 'Address' }, { name: 'index', type: 'u32' }],
    returns: 'u32',
    code: ['Enumerable::get_owner_token_id(e, &owner, index)'],
  },
  get_token_id: {
    args: [getSelfArg(), { name: 'index', type: 'u32' }],
    returns: 'u32',
    code: ['Enumerable::get_token_id(e, index)'],
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

const nonFungibleEnumerableTraitFunctions = pickKeys(enumerableFunctions, [
  'total_supply',
  'get_owner_token_id',
  'get_token_id',
]);

function addNonFungibleVotes(c: ContractBuilder, explicitImplementations: boolean) {
  c.addUseClause('stellar_tokens::non_fungible', 'votes::NonFungibleVotes');
  c.addUseClause('stellar_governance::votes', '{self as votes, Votes}', { groupable: false });

  c.overrideAssocType('NonFungibleToken', 'type ContractType = NonFungibleVotes;');

  const votesTrait = {
    traitName: 'Votes',
    structName: c.name,
    tags: explicitImplementations ? ['contractimpl'] : ['contractimpl(contracttrait)'],
    section: 'Extensions',
  };

  if (explicitImplementations) {
    c.addTraitForEachFunctions(votesTrait, nonFungibleVotesFunctions);
  } else {
    c.addTraitImplBlock(votesTrait);
  }
}

const nonFungibleVotesFunctions = defineFunctions({
  get_votes: {
    args: [getSelfArg(), { name: 'account', type: 'Address' }],
    returns: 'i128',
    code: ['votes::get_votes(e, &account)'],
  },
  get_votes_at_checkpoint: {
    args: [getSelfArg(), { name: 'account', type: 'Address' }, { name: 'ledger', type: 'u32' }],
    returns: 'i128',
    code: ['votes::get_votes_at_checkpoint(e, &account, ledger)'],
  },
  get_total_supply: {
    args: [getSelfArg()],
    returns: 'i128',
    code: ['votes::get_total_supply(e)'],
  },
  get_total_supply_at_checkpoint: {
    args: [getSelfArg(), { name: 'ledger', type: 'u32' }],
    returns: 'i128',
    code: ['votes::get_total_supply_at_checkpoint(e, ledger)'],
  },
  get_delegate: {
    args: [getSelfArg(), { name: 'account', type: 'Address' }],
    returns: 'Option<Address>',
    code: ['votes::get_delegate(e, &account)'],
  },
  delegate: {
    args: [getSelfArg(), { name: 'account', type: 'Address' }, { name: 'delegatee', type: 'Address' }],
    code: ['votes::delegate(e, &account, &delegatee)'],
  },
});

const votesMintFunctions = defineFunctions({
  mint: {
    args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'token_id', type: 'u32' }],
    code: ['NonFungibleVotes::mint(e, &to, token_id);'],
  },
  mint_with_caller: {
    name: 'mint',
    args: [
      getSelfArg(),
      { name: 'to', type: 'Address' },
      { name: 'token_id', type: 'u32' },
      { name: 'caller', type: 'Address' },
    ],
    code: ['NonFungibleVotes::mint(e, &to, token_id);'],
  },
  sequential_mint: {
    name: 'mint',
    args: [getSelfArg(), { name: 'to', type: 'Address' }],
    code: ['NonFungibleVotes::sequential_mint(e, &to);'],
  },
  sequential_mint_with_caller: {
    name: 'mint',
    args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'caller', type: 'Address' }],
    code: ['NonFungibleVotes::sequential_mint(e, &to);'],
  },
});

const consecutiveFunctions = defineFunctions({
  batch_mint: {
    name: 'batch_mint',
    args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'amount', type: 'u32' }],
    returns: 'u32',
    code: ['Consecutive::batch_mint(e, &to, amount)'],
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
    code: ['Consecutive::batch_mint(e, &to, amount)'],
  },
});
