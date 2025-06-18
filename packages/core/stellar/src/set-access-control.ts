import type { BaseFunction, BaseTraitImplBlock, ContractBuilder } from './contract';

export const accessOptions = [false, 'ownable'] as const;
export const DEFAULT_ACCESS_CONTROL = 'ownable';

export type Access = (typeof accessOptions)[number];

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
        c.addConstructorArgument({ name: 'owner', type: 'Address' });
        c.addConstructorCode('ownable::set_owner(e, &owner);');
      }
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
 *
 * If `caller` is provided, requires that the caller is the owner. Otherwise, requires that the owner is authorized.
 */
export function requireAccessControl(
  c: ContractBuilder,
  trait: BaseTraitImplBlock | undefined,
  fn: BaseFunction,
  access: Access,
  useMacro: boolean = true,
): void {
  if (access === false) {
    access = DEFAULT_ACCESS_CONTROL;
  }
  setAccessControl(c, access);

  switch (access) {
    case 'ownable': {
      c.addUseClause('soroban_sdk', 'Address');
      c.addUseClause('stellar_ownable', 'self', { alias: 'ownable' });
      c.addUseClause('stellar_ownable', 'Ownable');
      c.addUseClause('stellar_ownable_macro', 'only_owner');

      const ownableTrait = {
        traitName: 'Ownable',
        structName: c.name,
        tags: ['default_impl', 'contractimpl'],
        section: 'Utils',
      };
      c.addTraitImplBlock(ownableTrait);
      if (useMacro) {
        c.addFunctionTag(fn, 'only_owner', trait);
      } else {
        c.addFunctionCodeBefore(fn, [`ownable::enforce_owner_auth(e);`], trait);
      }

      break;
    }
    default: {
      const _: never = access;
      throw new Error('Unknown value for `access`');
    }
  }
}
