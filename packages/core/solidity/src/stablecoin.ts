import type { Contract, ContractBuilder } from './contract';
import type { Access } from './set-access-control';
import { setAccessControl, requireAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';
import { printContract } from './print';
import type { ERC20Options } from './erc20';
import {
  buildERC20,
  defaults as erc20defaults,
  withDefaults as withERC20Defaults,
  functions as erc20functions,
} from './erc20';

export interface StablecoinOptions extends ERC20Options {
  limitations?: false | 'allowlist' | 'blocklist';
  custodian?: boolean;
}

export const defaults: Required<StablecoinOptions> = {
  ...erc20defaults,
  name: 'MyStablecoin',
  symbol: 'MST',
  limitations: false,
  custodian: false,
} as const;

function withDefaults(opts: StablecoinOptions): Required<StablecoinOptions> {
  return {
    ...withERC20Defaults(opts),
    name: opts.name ?? defaults.name,
    symbol: opts.symbol ?? defaults.symbol,
    limitations: opts.limitations ?? defaults.limitations,
    custodian: opts.custodian ?? defaults.custodian,
  };
}

export function printStablecoin(opts: StablecoinOptions = defaults): string {
  return printContract(buildStablecoin(opts));
}

export function isAccessControlRequired(opts: Partial<StablecoinOptions>): boolean {
  return opts.mintable || opts.limitations !== false || opts.custodian || opts.pausable || opts.upgradeable === 'uups';
}

export function buildStablecoin(opts: StablecoinOptions): Contract {
  const allOpts = withDefaults(opts);

  // Upgradeability is not yet available for the community contracts
  allOpts.upgradeable = false;

  const c = buildERC20(allOpts);

  if (allOpts.custodian) {
    addCustodian(c, allOpts.access);
  }

  if (allOpts.limitations) {
    addLimitations(c, allOpts.access, allOpts.limitations);
  }

  return c;
}

function addLimitations(c: ContractBuilder, access: Access, mode: boolean | 'allowlist' | 'blocklist') {
  const type = mode === 'allowlist';
  const ERC20Limitation = {
    name: type ? 'ERC20Allowlist' : 'ERC20Blocklist',
    path: `@openzeppelin/community-contracts/token/ERC20/extensions/${type ? 'ERC20Allowlist' : 'ERC20Blocklist'}.sol`,
  };

  c.addParent(ERC20Limitation);
  c.addOverride(ERC20Limitation, functions._update);
  c.addOverride(ERC20Limitation, functions._approve);

  const [addFn, removeFn] = type
    ? [functions.allowUser, functions.disallowUser]
    : [functions.blockUser, functions.unblockUser];

  requireAccessControl(c, addFn, access, 'LIMITER', 'limiter');
  c.addFunctionCode(`_${type ? 'allowUser' : 'blockUser'}(user);`, addFn);

  requireAccessControl(c, removeFn, access, 'LIMITER', 'limiter');
  c.addFunctionCode(`_${type ? 'disallowUser' : 'unblockUser'}(user);`, removeFn);
}

function addCustodian(c: ContractBuilder, access: Access) {
  const ERC20Custodian = {
    name: 'ERC20Custodian',
    path: '@openzeppelin/community-contracts/token/ERC20/extensions/ERC20Custodian.sol',
  };

  c.addParent(ERC20Custodian);
  c.addOverride(ERC20Custodian, functions._update);
  c.addOverride(ERC20Custodian, functions._isCustodian);

  if (access === false) {
    access = 'ownable';
  }

  setAccessControl(c, access);

  switch (access) {
    case 'ownable': {
      c.setFunctionBody([`return user == owner();`], functions._isCustodian);
      break;
    }
    case 'roles': {
      const roleOwner = 'custodian';
      const roleId = 'CUSTODIAN_ROLE';
      const addedConstant = c.addVariable(`bytes32 public constant ${roleId} = keccak256("${roleId}");`);
      if (roleOwner && addedConstant) {
        c.addConstructorArgument({ type: 'address', name: roleOwner });
        c.addConstructorCode(`_grantRole(${roleId}, ${roleOwner});`);
      }
      c.setFunctionBody([`return hasRole(CUSTODIAN_ROLE, user);`], functions._isCustodian);
      break;
    }
    case 'managed': {
      c.addImportOnly({
        name: 'AuthorityUtils',
        path: `@openzeppelin/contracts/access/manager/AuthorityUtils.sol`,
      });
      const logic = [
        `(bool immediate,) = AuthorityUtils.canCallWithDelay(authority(), user, address(this), bytes4(_msgData()[0:4]));`,
        `return immediate;`,
      ];
      c.setFunctionBody(logic, functions._isCustodian);
      break;
    }
  }
}

const functions = {
  ...erc20functions,
  ...defineFunctions({
    _isCustodian: {
      kind: 'internal' as const,
      args: [{ name: 'user', type: 'address' }],
      returns: ['bool'],
      mutability: 'view' as const,
      comments: ['/// @dev Determines if an address has custodian privileges. Custodians can perform special operations on behalf of users.'],
    },

    allowUser: {
      kind: 'public' as const,
      args: [{ name: 'user', type: 'address' }],
      comments: ['/// @dev Grants permission for a user to interact with the contract. This is part of the allowlist mechanism for controlled access.'],
    },

    disallowUser: {
      kind: 'public' as const,
      args: [{ name: 'user', type: 'address' }],
      comments: ['/// @dev Revokes a user\'s permission to interact with the contract. This is part of the allowlist mechanism for controlled access.'],
    },

    blockUser: {
      kind: 'public' as const,
      args: [{ name: 'user', type: 'address' }],
      comments: ['/// @dev Blocks a user from interacting with the contract. This is part of the blocklist mechanism for controlled access.'],
    },

    unblockUser: {
      kind: 'public' as const,
      args: [{ name: 'user', type: 'address' }],
      comments: ['/// @dev Removes a user from the blocklist, restoring their ability to interact with the contract.'],
    },
  }),
};
