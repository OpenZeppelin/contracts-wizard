import { pickKeys } from '@openzeppelin/wizard-common';
import { addPausable } from './add-pausable';
import { addUpgradeable } from './add-upgradeable';
import { addVotes } from './add-votes';
import type { CommonContractOptions } from './common-options';
import { contractDefaults as commonDefaults, getSelfArg, withCommonContractDefaults } from './common-options';
import type { BaseFunction, Contract } from './contract';
import { ContractBuilder } from './contract';
import type { OptionsErrorMessages } from './error';
import { OptionsError } from './error';
import { printContract } from './print';
import { type Access, DEFAULT_ACCESS_CONTROL, requireAccessControl, setAccessControl } from './set-access-control';
import { setInfo } from './set-info';
import { printComposedContractType } from './utils/compose';
import { toByteArray, toUint } from './utils/convert-strings';
import { defineFunctions } from './utils/define-functions';

// Upper bound enforced by the library's royalty setters (100% in basis points).
const MAX_ROYALTY_BASIS_POINTS = 10_000n;

export const defaults: Required<NonFungibleOptions> = {
  name: 'MyToken',
  symbol: 'MTK',
  tokenUri: 'https://www.mytoken.com',
  burnable: false,
  votes: false,
  enumerable: false,
  consecutive: false,
  royalties: false,
  defaultRoyaltyBasisPoints: '0',
  pausable: false,
  upgradeable: false,
  mintable: false,
  sequential: false,
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
  votes?: boolean;
  enumerable?: boolean;
  consecutive?: boolean;
  royalties?: boolean;
  defaultRoyaltyBasisPoints?: string;
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
    votes: opts.votes ?? defaults.votes,
    consecutive: opts.consecutive ?? defaults.consecutive,
    enumerable: opts.enumerable ?? defaults.enumerable,
    royalties: opts.royalties ?? defaults.royalties,
    defaultRoyaltyBasisPoints: opts.defaultRoyaltyBasisPoints || defaults.defaultRoyaltyBasisPoints,
    pausable: opts.pausable ?? defaults.pausable,
    upgradeable: opts.upgradeable ?? defaults.upgradeable,
    mintable: opts.mintable ?? defaults.mintable,
    sequential: opts.sequential ?? defaults.sequential,
  };
}

export function isAccessControlRequired(opts: Partial<NonFungibleOptions>): boolean {
  return (
    opts.mintable === true ||
    opts.pausable === true ||
    opts.upgradeable === true ||
    opts.consecutive === true ||
    opts.royalties === true
  );
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

  // Order follows the library's documentation, e.g. `Compose<(Enumerable, NonFungibleVotes)>`.
  const contractTypes = [
    ...(allOpts.enumerable ? ['Enumerable'] : []),
    ...(allOpts.consecutive ? ['Consecutive'] : []),
    ...(allOpts.votes ? ['NonFungibleVotes'] : []),
  ];

  addBase(
    c,
    toByteArray(allOpts.name),
    toByteArray(allOpts.symbol),
    toByteArray(allOpts.tokenUri),
    contractTypes,
    allOpts.pausable,
    allOpts.explicitImplementations,
  );

  if (allOpts.votes) {
    addVotes(c, allOpts.explicitImplementations);
  }

  if (allOpts.royalties) {
    addRoyalties(c, allOpts.defaultRoyaltyBasisPoints, allOpts.access, allOpts.explicitImplementations);
  }

  if (allOpts.pausable) {
    addPausable(c, allOpts.access, allOpts.explicitImplementations);
  }

  if (allOpts.upgradeable) {
    addUpgradeable(c, allOpts.access, allOpts.explicitImplementations);
  }

  if (allOpts.burnable) {
    addBurnable(c, allOpts.pausable, allOpts.explicitImplementations);
  }

  if (allOpts.enumerable) {
    addEnumerable(c, allOpts.explicitImplementations);
  }

  if (allOpts.consecutive) {
    addConsecutive(c, allOpts.pausable, allOpts.access, allOpts.explicitImplementations);
  }

  if (allOpts.mintable) {
    addMintable(c, allOpts.pausable, allOpts.sequential, allOpts.access, allOpts.explicitImplementations);
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
  contractTypes: string[],
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
  c.addUseClause('stellar_tokens::non_fungible', 'Compose');
  c.addUseClause('stellar_tokens::non_fungible', 'NonFungibleToken');
  if (contractTypes.includes('NonFungibleVotes')) {
    c.addUseClause('stellar_tokens::non_fungible', 'votes::NonFungibleVotes');
  }
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
    assocType: printComposedContractType(contractTypes.length > 0 ? contractTypes : ['Base']),
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

function addBurnable(c: ContractBuilder, pausable: boolean, explicitImplementations: boolean) {
  c.addUseClause('stellar_tokens::non_fungible', 'burnable::NonFungibleBurnable');

  const nonFungibleBurnableTrait = {
    traitName: 'NonFungibleBurnable',
    structName: c.name,
    tags: explicitImplementations ? ['contractimpl'] : ['contractimpl(contracttrait)'],
    section: 'Extensions',
  };

  if (pausable) {
    c.addUseClause('stellar_macros', 'when_not_paused');

    c.addTraitFunction(nonFungibleBurnableTrait, burnableFunctions.burn);
    c.addFunctionTag(burnableFunctions.burn, 'when_not_paused', nonFungibleBurnableTrait);

    c.addTraitFunction(nonFungibleBurnableTrait, burnableFunctions.burn_from);
    c.addFunctionTag(burnableFunctions.burn_from, 'when_not_paused', nonFungibleBurnableTrait);
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

  const mintFn =
    effectiveAccess === 'ownable' ? consecutiveFunctions.mint_range : consecutiveFunctions.mint_range_with_caller;
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
  pausable: boolean,
  sequential: boolean,
  access: Access,
  explicitImplementations: boolean,
) {
  const accessProps = { useMacro: true, role: 'minter', caller: 'caller' };
  const effectiveAccess = access === false ? DEFAULT_ACCESS_CONTROL : access;

  let mintFn: BaseFunction;
  if (sequential) {
    mintFn = effectiveAccess === 'ownable' ? mintFunctions.mint : mintFunctions.mint_with_caller;
  } else {
    mintFn = effectiveAccess === 'ownable' ? mintFunctions.mint_with_id : mintFunctions.mint_with_id_with_caller;
  }

  c.addFreeFunction(mintFn);
  requireAccessControl(c, undefined, mintFn, effectiveAccess, accessProps, explicitImplementations);

  if (pausable) {
    c.addFunctionTag(mintFn, 'when_not_paused');
  }
}

function addRoyalties(
  c: ContractBuilder,
  defaultRoyaltyBasisPoints: string,
  access: Access,
  explicitImplementations: boolean,
) {
  const basisPoints = toUint(defaultRoyaltyBasisPoints, 'defaultRoyaltyBasisPoints', 'u32');
  if (basisPoints > MAX_ROYALTY_BASIS_POINTS) {
    throw new OptionsError({
      defaultRoyaltyBasisPoints: `Maximum royalty is ${MAX_ROYALTY_BASIS_POINTS} basis points (100%)`,
    });
  }

  c.addUseClause('stellar_tokens::non_fungible', 'royalties::{NonFungibleRoyalties, RoyaltySupport}');

  if (basisPoints > 0n) {
    c.addConstructorArgument({ name: 'royalty_receiver', type: 'Address' });
    c.addConstructorCode(`Base::set_default_royalty(e, &royalty_receiver, ${basisPoints});`);
  }

  const nonFungibleRoyaltiesTrait = {
    traitName: 'NonFungibleRoyalties',
    structName: c.name,
    tags: explicitImplementations ? ['contractimpl'] : ['contractimpl(contracttrait)'],
    section: 'Extensions',
  };

  const effectiveAccess = access === false ? DEFAULT_ACCESS_CONTROL : access;
  const settersFns =
    effectiveAccess === 'ownable'
      ? [
          royaltiesFunctions.set_default_royalty_unused_operator,
          royaltiesFunctions.set_token_royalty_unused_operator,
          royaltiesFunctions.remove_token_royalty_unused_operator,
        ]
      : [
          royaltiesFunctions.set_default_royalty,
          royaltiesFunctions.set_token_royalty,
          royaltiesFunctions.remove_token_royalty,
        ];

  // Setting royalties is privileged, so the library provides no default implementation for the setters.
  for (const fn of settersFns) {
    c.addTraitFunction(nonFungibleRoyaltiesTrait, fn);
    requireAccessControl(
      c,
      nonFungibleRoyaltiesTrait,
      fn,
      effectiveAccess,
      {
        useMacro: true,
        role: 'royalty_admin',
        caller: 'operator',
      },
      explicitImplementations,
    );
  }

  if (explicitImplementations) c.addTraitFunction(nonFungibleRoyaltiesTrait, royaltiesFunctions.royalty_info);
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
});

// Minting goes through the contract type, which keeps the enumeration and the voting units up to date.
const mintFunctions = defineFunctions({
  mint: {
    args: [getSelfArg(), { name: 'to', type: 'Address' }],
    returns: 'u32',
    code: ['<Self as NonFungibleToken>::ContractType::mint(e, &to)'],
  },
  mint_with_caller: {
    name: 'mint',
    args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'caller', type: 'Address' }],
    returns: 'u32',
    code: ['<Self as NonFungibleToken>::ContractType::mint(e, &to)'],
  },
  mint_with_id: {
    name: 'mint',
    args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'token_id', type: 'u32' }],
    code: ['<Self as NonFungibleToken>::ContractType::mint_with_id(e, &to, token_id);'],
  },
  mint_with_id_with_caller: {
    name: 'mint',
    args: [
      getSelfArg(),
      { name: 'to', type: 'Address' },
      { name: 'token_id', type: 'u32' },
      { name: 'caller', type: 'Address' },
    ],
    code: ['<Self as NonFungibleToken>::ContractType::mint_with_id(e, &to, token_id);'],
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
});

const nonFungibleEnumerableTraitFunctions = pickKeys(enumerableFunctions, [
  'total_supply',
  'get_owner_token_id',
  'get_token_id',
]);

const consecutiveFunctions = defineFunctions({
  mint_range: {
    args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'amount', type: 'u32' }],
    returns: 'u32',
    code: ['<Self as NonFungibleToken>::ContractType::mint_range(e, &to, amount)'],
  },
  mint_range_with_caller: {
    name: 'mint_range',
    args: [
      getSelfArg(),
      { name: 'to', type: 'Address' },
      { name: 'amount', type: 'u32' },
      { name: 'caller', type: 'Address' },
    ],
    returns: 'u32',
    code: ['<Self as NonFungibleToken>::ContractType::mint_range(e, &to, amount)'],
  },
});

const royaltiesFunctions = defineFunctions({
  set_default_royalty: {
    args: [
      getSelfArg(),
      { name: 'receiver', type: 'Address' },
      { name: 'basis_points', type: 'u32' },
      { name: 'operator', type: 'Address' },
    ],
    code: ['Base::set_default_royalty(e, &receiver, basis_points)'],
  },
  set_default_royalty_unused_operator: {
    name: 'set_default_royalty',
    args: [
      getSelfArg(),
      { name: 'receiver', type: 'Address' },
      { name: 'basis_points', type: 'u32' },
      { name: '_operator', type: 'Address' },
    ],
    code: ['Base::set_default_royalty(e, &receiver, basis_points)'],
  },
  set_token_royalty: {
    args: [
      getSelfArg(),
      { name: 'token_id', type: 'u32' },
      { name: 'receiver', type: 'Address' },
      { name: 'basis_points', type: 'u32' },
      { name: 'operator', type: 'Address' },
    ],
    code: ['Self::ContractType::set_token_royalty(e, token_id, &receiver, basis_points)'],
  },
  set_token_royalty_unused_operator: {
    name: 'set_token_royalty',
    args: [
      getSelfArg(),
      { name: 'token_id', type: 'u32' },
      { name: 'receiver', type: 'Address' },
      { name: 'basis_points', type: 'u32' },
      { name: '_operator', type: 'Address' },
    ],
    code: ['Self::ContractType::set_token_royalty(e, token_id, &receiver, basis_points)'],
  },
  remove_token_royalty: {
    args: [getSelfArg(), { name: 'token_id', type: 'u32' }, { name: 'operator', type: 'Address' }],
    code: ['Self::ContractType::remove_token_royalty(e, token_id)'],
  },
  remove_token_royalty_unused_operator: {
    name: 'remove_token_royalty',
    args: [getSelfArg(), { name: 'token_id', type: 'u32' }, { name: '_operator', type: 'Address' }],
    code: ['Self::ContractType::remove_token_royalty(e, token_id)'],
  },
  royalty_info: {
    args: [getSelfArg(), { name: 'token_id', type: 'u32' }, { name: 'sale_price', type: 'i128' }],
    returns: '(Address, i128)',
    code: ['Self::ContractType::royalty_info(e, token_id, sale_price)'],
  },
});
