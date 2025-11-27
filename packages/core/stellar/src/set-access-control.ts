import type { BaseFunction, BaseTraitImplBlock, ContractBuilder } from './contract';
import { defineFunctions } from './utils/define-functions';
import { getSelfArg } from './common-options';

export const accessOptions = [false, 'ownable', 'roles'] as const;
export const DEFAULT_ACCESS_CONTROL = 'ownable';

export type Access = (typeof accessOptions)[number];
export type AccessProps = {
  useMacro: boolean;
  caller?: string;
  role?: string;
};

/**
 * Sets access control for the contract via constructor args.
 */
export function setAccessControl(c: ContractBuilder, access: Access, explicitImplementations = false): void {
  switch (access) {
    case false:
      break;
    case 'ownable': {
      if (!c.ownable) {
        c.ownable = true;
        c.addUseClause('soroban_sdk', 'Address');
        c.addUseClause('stellar_access::ownable', 'self', { alias: 'ownable' });
        c.addUseClause('stellar_access::ownable', 'Ownable');

        const ownableTrait = {
          traitName: 'Ownable',
          structName: c.name,
          tags: explicitImplementations ? ['contractimpl'] : ['default_impl', 'contractimpl'],
          section: 'Utils',
        };
        if (explicitImplementations) {
          c.addTraitForEachFunctions(ownableTrait, ownableFunctions);
        } else {
          c.addTraitImplBlock(ownableTrait);
        }

        c.addConstructorArgument({ name: 'owner', type: 'Address' });
        c.addConstructorCode('ownable::set_owner(e, &owner);');
      }
      break;
    }
    case 'roles': {
      c.addUseClause('soroban_sdk', 'Address');
      c.addUseClause('soroban_sdk', 'Symbol');
      c.addUseClause('stellar_access::access_control', 'self', { alias: 'access_control' });
      c.addUseClause('stellar_access::access_control', 'AccessControl');

      const accessControlTrait = {
        traitName: 'AccessControl',
        structName: c.name,
        tags: explicitImplementations ? ['contractimpl'] : ['default_impl', 'contractimpl'],
        section: 'Utils',
      };
      if (explicitImplementations) {
        c.addTraitForEachFunctions(accessControlTrait, accessControlFunctions);
      } else {
        c.addTraitImplBlock(accessControlTrait);
      }

      c.addConstructorArgument({ name: 'admin', type: 'Address' });
      c.addConstructorCode('access_control::set_admin(e, &admin);');
      break;
    }
    default: {
      const _: never = access;
      throw new Error('Unknown value for `access`');
    }
  }
}

/**
 * Enables access control for the contract and restricts the given function with access control.
 */
export function requireAccessControl(
  c: ContractBuilder,
  trait: BaseTraitImplBlock | undefined,
  fn: BaseFunction,
  access: Access,
  accessProps: AccessProps = { useMacro: true },
  explicitImplementations = false,
): void {
  if (access === false) {
    access = DEFAULT_ACCESS_CONTROL;
  }
  setAccessControl(c, access, explicitImplementations);

  switch (access) {
    case 'ownable': {
      c.addUseClause('stellar_macros', 'only_owner');

      if (accessProps.useMacro) {
        c.addFunctionTag(fn, 'only_owner', trait);
      } else {
        c.addFunctionCodeBefore(fn, [`ownable::enforce_owner_auth(e);`], trait);
      }

      break;
    }
    case 'roles': {
      const { useMacro, caller, role } = accessProps;

      if (caller && role) {
        c.addUseClause('soroban_sdk', 'Symbol');
        c.addConstructorArgument({ name: role, type: 'Address' });
        c.addConstructorCode(`access_control::grant_role_no_auth(e, &admin, &${role}, &Symbol::new(e, "${role}"));`);

        if (useMacro) {
          c.addUseClause('stellar_macros', 'only_role');
          c.addFunctionTag(fn, `only_role(${caller}, "${role}")`, trait);
        } else {
          c.addFunctionCodeBefore(
            fn,
            [`access_control::ensure_role(e, ${caller}, &Symbol::new(e, "${role}"));`],
            trait,
          );
        }
      } else {
        if (useMacro) {
          c.addUseClause('stellar_macros', 'only_admin');
          c.addFunctionTag(fn, 'only_admin', trait);
        } else {
          c.addFunctionCodeBefore(fn, ['access_control::enforce_admin_auth(e);'], trait);
        }
      }

      break;
    }
    default: {
      const _: never = access;
      throw new Error('Unknown value for `access`');
    }
  }
}

const ownableFunctions = defineFunctions({
  get_owner: {
    args: [getSelfArg()],
    returns: 'Option<Address>',
    code: ['ownable::get_owner(e)'],
  },
  transfer_ownership: {
    args: [getSelfArg(), { name: 'new_owner', type: 'Address' }, { name: 'live_until_ledger', type: 'u32' }],
    code: ['ownable::transfer_ownership(e, &new_owner, live_until_ledger);'],
  },
  accept_ownership: {
    args: [getSelfArg()],
    code: ['ownable::accept_ownership(e);'],
  },
  renounce_ownership: {
    args: [getSelfArg()],
    code: ['ownable::renounce_ownership(e);'],
  },
});

const accessControlFunctions = defineFunctions({
  has_role: {
    args: [getSelfArg(), { name: 'account', type: 'Address' }, { name: 'role', type: 'Symbol' }],
    returns: 'Option<u32>',
    code: ['access_control::has_role(e, &account, &role)'],
  },
  get_role_member_count: {
    args: [getSelfArg(), { name: 'role', type: 'Symbol' }],
    returns: 'u32',
    code: ['access_control::get_role_member_count(e, &role)'],
  },
  get_role_member: {
    args: [getSelfArg(), { name: 'role', type: 'Symbol' }, { name: 'index', type: 'u32' }],
    returns: 'Address',
    code: ['access_control::get_role_member(e, &role, index)'],
  },
  get_role_admin: {
    args: [getSelfArg(), { name: 'role', type: 'Symbol' }],
    returns: 'Option<Symbol>',
    code: ['access_control::get_role_admin(e, &role)'],
  },
  get_admin: {
    args: [getSelfArg()],
    returns: 'Option<Address>',
    code: ['access_control::get_admin(e)'],
  },
  grant_role: {
    args: [
      getSelfArg(),
      { name: 'caller', type: 'Address' },
      { name: 'account', type: 'Address' },
      { name: 'role', type: 'Symbol' },
    ],
    code: ['access_control::grant_role(e, &caller, &account, &role);'],
  },
  revoke_role: {
    args: [
      getSelfArg(),
      { name: 'caller', type: 'Address' },
      { name: 'account', type: 'Address' },
      { name: 'role', type: 'Symbol' },
    ],
    code: ['access_control::revoke_role(e, &caller, &account, &role);'],
  },
  renounce_role: {
    args: [getSelfArg(), { name: 'caller', type: 'Address' }, { name: 'role', type: 'Symbol' }],
    code: ['access_control::renounce_role(e, &caller, &role);'],
  },
  transfer_admin_role: {
    args: [getSelfArg(), { name: 'new_admin', type: 'Address' }, { name: 'live_until_ledger', type: 'u32' }],
    code: ['access_control::transfer_admin_role(e, &new_admin, live_until_ledger);'],
  },
  accept_admin_transfer: {
    args: [getSelfArg()],
    code: ['access_control::accept_admin_transfer(e);'],
  },
  set_role_admin: {
    args: [getSelfArg(), { name: 'role', type: 'Symbol' }, { name: 'admin_role', type: 'Symbol' }],
    code: ['access_control::set_role_admin(e, &role, &admin_role);'],
  },
  renounce_admin: {
    args: [getSelfArg()],
    code: ['access_control::renounce_admin(e);'],
  },
});
