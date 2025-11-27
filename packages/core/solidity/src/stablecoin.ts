import type { Contract, ContractBuilder } from './contract';
import type { Access } from './set-access-control';
import { requireAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';
import { printContract } from './print';
import type { ERC20Options } from './erc20';
import {
  buildERC20,
  defaults as erc20defaults,
  withDefaults as withERC20Defaults,
  functions as erc20functions,
  isAccessControlRequired as erc20isAccessControlRequired,
} from './erc20';

export interface StablecoinOptions extends ERC20Options {
  restrictions?: false | 'allowlist' | 'blocklist';
  freezable?: boolean;
}

export const defaults: Required<StablecoinOptions> = {
  ...erc20defaults,
  name: 'MyStablecoin',
  symbol: 'MST',
  restrictions: false,
  freezable: false,
} as const;

function withDefaults(opts: StablecoinOptions): Required<StablecoinOptions> {
  return {
    ...withERC20Defaults(opts),
    name: opts.name ?? defaults.name,
    symbol: opts.symbol ?? defaults.symbol,
    restrictions: opts.restrictions ?? defaults.restrictions,
    freezable: opts.freezable ?? defaults.freezable,
  };
}

export function printStablecoin(opts: StablecoinOptions = defaults): string {
  return printContract(buildStablecoin(opts));
}

export function isAccessControlRequired(opts: Partial<StablecoinOptions>): boolean {
  return erc20isAccessControlRequired(opts) || !!opts.restrictions || !!opts.freezable;
}

export function buildStablecoin(opts: StablecoinOptions): Contract {
  const allOpts = withDefaults(opts);

  // Upgradeability is not yet available for the community contracts
  allOpts.upgradeable = false;

  const c = buildERC20(allOpts);

  if (allOpts.freezable) {
    addFreezable(c, allOpts.access);
  }

  if (allOpts.restrictions) {
    addRestrictions(c, allOpts.access, allOpts.restrictions);
  }

  return c;
}

function addRestrictions(c: ContractBuilder, access: Access, mode: 'allowlist' | 'blocklist') {
  const isAllowlist = mode === 'allowlist';
  const ERC20Restricted = {
    name: 'ERC20Restricted',
    path: `@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Restricted.sol`,
  };

  c.addParent(ERC20Restricted);
  c.addOverride(ERC20Restricted, functions._update);

  if (isAllowlist) {
    c.addOverride(ERC20Restricted, functions.isUserAllowed);
    c.setFunctionBody([`return getRestriction(user) == Restriction.ALLOWED;`], functions.isUserAllowed);
  }

  const [addFn, removeFn] = isAllowlist
    ? [functions.allowUser, functions.disallowUser]
    : [functions.blockUser, functions.unblockUser];

  requireAccessControl(c, addFn, access, 'LIMITER', 'limiter');
  c.addFunctionCode(`_${isAllowlist ? 'allow' : 'block'}User(user);`, addFn);

  requireAccessControl(c, removeFn, access, 'LIMITER', 'limiter');
  c.addFunctionCode(`_resetUser(user);`, removeFn);
}

function addFreezable(c: ContractBuilder, access: Access) {
  const ERC20Freezable = {
    name: 'ERC20Freezable',
    path: '@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Freezable.sol',
  };

  c.addParent(ERC20Freezable);
  c.addOverride(ERC20Freezable, functions._update);

  if (access === false) {
    access = 'ownable';
  }

  const freezeFn = functions.freeze;
  requireAccessControl(c, freezeFn, access, 'FREEZER', 'freezer');
  c.setFunctionBody([`_setFrozen(user, amount);`], freezeFn);
}

const functions = {
  ...erc20functions,
  ...defineFunctions({
    freeze: {
      kind: 'public' as const,
      args: [
        { name: 'user', type: 'address' },
        { name: 'amount', type: 'uint256' },
      ],
    },

    allowUser: {
      kind: 'public' as const,
      args: [{ name: 'user', type: 'address' }],
    },

    disallowUser: {
      kind: 'public' as const,
      args: [{ name: 'user', type: 'address' }],
    },

    blockUser: {
      kind: 'public' as const,
      args: [{ name: 'user', type: 'address' }],
    },

    unblockUser: {
      kind: 'public' as const,
      args: [{ name: 'user', type: 'address' }],
    },

    isUserAllowed: {
      kind: 'public' as const,
      args: [{ name: 'user', type: 'address' }],
      returns: ['bool'],
      mutability: 'view' as const,
    },
  }),
};
