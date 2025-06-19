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
} from './fungible';
import { requireAccessControl, type Access } from './set-access-control';

export const defaults: Required<StablecoinOptions> = {
  ...fungibleDefaults,
  name: 'MyStablecoin',
  symbol: 'MST',
  limitations: false,
} as const;

export function printStablecoin(opts: StablecoinOptions = defaults): string {
  return printContract(buildStablecoin(opts));
}

export interface StablecoinOptions extends FungibleOptions {
  limitations?: false | 'allowlist' | 'blocklist';
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
  return opts.mintable === true || opts.limitations !== false || opts.pausable === true || opts.upgradeable === true;
}

export function buildStablecoin(opts: StablecoinOptions): Contract {
  const allOpts = withDefaults(opts);

  const c = buildFungible(allOpts);

  if (allOpts.limitations) {
    addLimitations(c, allOpts.access, allOpts.limitations);
  }

  return c;
}

function addLimitations(c: ContractBuilder, access: Access, mode: boolean | 'allowlist' | 'blocklist') {
  const type = mode === 'allowlist';

  const limitationsTrait = {
    traitName: type ? 'FungibleAllowList' : 'FungibleBlockList',
    structName: c.name,
    tags: ['contractimpl'],
    section: 'Extensions',
  };

  if (type) {
    c.addUseClause('stellar_fungible', 'allowlist::{AllowList, FungibleAllowList}');
    c.overrideAssocType('FungibleToken', 'type ContractType = AllowList;');
  } else {
    c.addUseClause('stellar_fungible', 'blocklist::{BlockList, FungibleBlockList}');
    c.overrideAssocType('FungibleToken', 'type ContractType = BlockList;');
  }

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
  requireAccessControl(c, limitationsTrait, addFn, access, accessProps);

  c.addTraitFunction(limitationsTrait, removeFn);
  requireAccessControl(c, limitationsTrait, removeFn, access, accessProps);
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
