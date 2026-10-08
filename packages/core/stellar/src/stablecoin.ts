import { getSelfArg } from './common-options';
import type { Contract, ContractBuilder } from './contract';
import type { FungibleOptions, TransferPolicy } from './fungible';
import {
  buildFungibleWithTransferPolicy,
  defaults as fungibleDefaults,
  functions as fungibleFunctions,
  isAccessControlRequired as fungibleIsAccessControlRequired,
  withDefaults as withFungibleDefaults,
} from './fungible';
import { printContract } from './print';
import { requireAccessControl, type Access } from './set-access-control';
import { defineFunctions } from './utils/define-functions';

export const defaults: Required<StablecoinOptions> = {
  ...fungibleDefaults,
  name: 'MyStablecoin',
  symbol: 'MST',
  limitations: false,
} as const;

export const limitationsOptions = [false, 'allowlist', 'blocklist'] as const;
export type Limitations = (typeof limitationsOptions)[number];

const transferPolicies = {
  allowlist: 'AllowList',
  blocklist: 'BlockList',
} as const satisfies Record<Exclude<Limitations, false>, TransferPolicy>;

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

  const transferPolicy = allOpts.limitations ? transferPolicies[allOpts.limitations] : undefined;
  const c = buildFungibleWithTransferPolicy(allOpts, transferPolicy);

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
  } else {
    c.addUseClause('stellar_tokens::fungible', 'blocklist::{BlockList, FungibleBlockList}');
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
  requireAccessControl(c, limitationsTrait, addFn, access, accessProps, explicitImplementations);

  c.addTraitFunction(limitationsTrait, removeFn);
  requireAccessControl(c, limitationsTrait, removeFn, access, accessProps, explicitImplementations);
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
