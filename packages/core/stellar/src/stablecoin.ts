import type { Contract, ContractBuilder } from './contract';
import { defineFunctions } from './utils/define-functions';
import { getSelfArg } from './common-options';
import { printContract } from './print';
import type { FungibleOptions } from './fungible';
import {
  buildFungible,
  defaults as fungibleDefaults,
  withDefaults as withFungibleDefaults,
  functions as fungibleFunctions,
  isAccessControlRequired as fungibleIsAccessControlRequired,
} from './fungible';
import { requireAccessControl, type Access } from './set-access-control';

export const defaults: Required<StablecoinOptions> = {
  ...fungibleDefaults,
  name: 'MyStablecoin',
  symbol: 'MST',
  limitations: false,
} as const;

export const limitationsOptions = [false, 'allowlist', 'blocklist'] as const;
export type Limitations = (typeof limitationsOptions)[number];

export function printStablecoin(opts: StablecoinOptions = defaults): string {
  return printContract(buildStablecoin(opts));
}

export interface StablecoinOptions extends FungibleOptions {
  limitations?: Limitations;
}

function withDefaults(opts: StablecoinOptions): Required<StablecoinOptions> {
  return {
    ...withFungibleDefaults(opts),
    name: opts.name ?? defaults.name,
    symbol: opts.symbol ?? defaults.symbol,
    limitations: opts.limitations ?? defaults.limitations,
  };
}

export function isAccessControlRequired(opts: Partial<StablecoinOptions>): boolean {
  return fungibleIsAccessControlRequired(opts) || opts.limitations !== false;
}

export function buildStablecoin(opts: StablecoinOptions): Contract {
  const allOpts = withDefaults(opts);

  const c = buildFungible(allOpts);

  if (allOpts.limitations) {
    addLimitations(c, allOpts.access, allOpts.limitations, allOpts.explicitImplementations);
  }

  return c;
}

function addLimitations(
  c: ContractBuilder,
  access: Access,
  mode: 'allowlist' | 'blocklist',
  explicitImplementations: boolean,
) {
  const type = mode === 'allowlist';

  const limitationsTrait = {
    traitName: type ? 'FungibleAllowList' : 'FungibleBlockList',
    structName: c.name,
    tags: ['contractimpl'],
    section: 'Extensions',
  };

  if (type) {
    c.addUseClause('stellar_tokens::fungible', 'allowlist::{AllowList, FungibleAllowList}');
    c.overrideAssocType('FungibleToken', 'type ContractType = AllowList;');
  } else {
    c.addUseClause('stellar_tokens::fungible', 'blocklist::{BlockList, FungibleBlockList}');
    c.overrideAssocType('FungibleToken', 'type ContractType = BlockList;');
  }

  if (explicitImplementations) overrideFungibleReadonlyFunctionsWithBase(c);

  const [getterFn, addFn, removeFn] = type
    ? [functions.allowed, functions.allow_user, functions.disallow_user]
    : [functions.blocked, functions.block_user, functions.unblock_user];

  c.addTraitFunction(limitationsTrait, getterFn);

  const accessProps = {
    useMacro: true,
    role: 'manager',
    caller: 'operator',
  };

  c.addTraitFunction(limitationsTrait, addFn);
  requireAccessControl(c, limitationsTrait, addFn, access, accessProps, explicitImplementations);

  c.addTraitFunction(limitationsTrait, removeFn);
  requireAccessControl(c, limitationsTrait, removeFn, access, accessProps, explicitImplementations);
}

function overrideFungibleReadonlyFunctionsWithBase(c: ContractBuilder) {
  const fungibleTokenTrait = {
    traitName: 'FungibleToken',
    structName: c.name,
    tags: [],
  };

  const overrides: Array<[(typeof fungibleFunctions)[keyof typeof fungibleFunctions], string[]]> = [
    [fungibleFunctions.total_supply, ['Base::total_supply(e)']],
    [fungibleFunctions.balance, ['Base::balance(e, &account)']],
    [fungibleFunctions.allowance, ['Base::allowance(e, &owner, &spender)']],
    [fungibleFunctions.decimals, ['Base::decimals(e)']],
    [fungibleFunctions.name, ['Base::name(e)']],
    [fungibleFunctions.symbol, ['Base::symbol(e)']],
  ];

  for (const [fn, code] of overrides) {
    c.setFunctionCode(fn, code, fungibleTokenTrait);
  }
}

const functions = {
  ...fungibleFunctions,
  ...defineFunctions({
    allowed: {
      args: [getSelfArg(), { name: 'account', type: 'Address' }],
      returns: 'bool',
      code: ['AllowList::allowed(e, &account)'],
    },
    allow_user: {
      args: [getSelfArg(), { name: 'user', type: 'Address' }, { name: 'operator', type: 'Address' }],
      code: ['AllowList::allow_user(e, &user)'],
    },
    disallow_user: {
      args: [getSelfArg(), { name: 'user', type: 'Address' }, { name: 'operator', type: 'Address' }],
      code: ['AllowList::disallow_user(e, &user)'],
    },
    blocked: {
      args: [getSelfArg(), { name: 'account', type: 'Address' }],
      returns: 'bool',
      code: ['BlockList::blocked(e, &account)'],
    },
    block_user: {
      args: [getSelfArg(), { name: 'user', type: 'Address' }, { name: 'operator', type: 'Address' }],
      code: ['BlockList::block_user(e, &user)'],
    },
    unblock_user: {
      args: [getSelfArg(), { name: 'user', type: 'Address' }, { name: 'operator', type: 'Address' }],
      code: ['BlockList::unblock_user(e, &user)'],
    },
  }),
};
