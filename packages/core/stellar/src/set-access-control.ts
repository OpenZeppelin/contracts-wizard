import type { BaseFunction, BaseImplementedTrait, ContractBuilder } from './contract';

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
        c.addUseClause('soroban_sdk', 'symbol_short');
        c.addUseClause('soroban_sdk', 'Symbol');
        c.addVariable({ name: 'OWNER', type: 'Symbol', value: `symbol_short!("OWNER")` });
        c.addConstructorArgument({ name: 'owner', type: 'Address' });
        c.addConstructorCode('e.storage().instance().set(&OWNER, &owner);');
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
  trait: BaseImplementedTrait,
  fn: BaseFunction,
  access: Access,
  caller?: string,
): void {
  if (access === false) {
    access = DEFAULT_ACCESS_CONTROL;
  }
  setAccessControl(c, access);

  switch (access) {
    case 'ownable': {
      c.addUseClause('soroban_sdk', 'Address');
      const getOwner = 'let owner: Address = e.storage().instance().get(&OWNER).expect("owner should be set");';
      if (caller) {
        c.addUseClause('soroban_sdk', 'panic_with_error');
        c.addError('Unauthorized', 1); // TODO: Ensure there are no conflicts in error codes
        c.addFunctionCodeBefore(trait, fn, [
          getOwner,
          'if owner != caller {',
          `    panic_with_error!(e, ${c.name}Error::Unauthorized)`,
          '}',
        ]);
      } else {
        c.addFunctionCodeBefore(trait, fn, [getOwner, 'owner.require_auth();']);
      }
      break;
    }
    default: {
      const _: never = access;
      throw new Error('Unknown value for `access`');
    }
  }
}
