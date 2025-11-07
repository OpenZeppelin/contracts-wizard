import type { BaseFunction, BaseTraitImplBlock, ContractBuilder } from './contract';

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
export function setAccessControl(c: ContractBuilder, access: Access): void {
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
          tags: ['default_impl', 'contractimpl'],
          section: 'Utils',
        };
        c.addTraitImplBlock(ownableTrait);

        c.addConstructorArgument({ name: 'owner', type: 'Address', value: '<owner address>' });
        c.addConstructorCode('ownable::set_owner(e, &owner);');
      }
      break;
    }
    case 'roles': {
      c.addUseClause('soroban_sdk', 'Address');
      c.addUseClause('stellar_access::access_control', 'self', { alias: 'access_control' });
      c.addUseClause('stellar_access::access_control', 'AccessControl');

      const accessControltrait = {
        traitName: 'AccessControl',
        structName: c.name,
        tags: ['default_impl', 'contractimpl'],
        section: 'Utils',
      };
      c.addTraitImplBlock(accessControltrait);

      c.addConstructorArgument({ name: 'admin', type: 'Address', value: '<admin address>' });
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
): void {
  if (access === false) {
    access = DEFAULT_ACCESS_CONTROL;
  }
  setAccessControl(c, access);

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
        c.addConstructorArgument({ name: role, type: 'Address', value: `<${role} address>` });
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
