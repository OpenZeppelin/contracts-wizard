import type { BaseFunction, BaseImplementedTrait, ContractBuilder } from './contract';

export const accessOptions = [false, 'ownable', 'roles'] as const;
export const DEFAULT_ACCESS_CONTROL = 'ownable';

export type Access = (typeof accessOptions)[number];

/**
 * Sets access control for the contract via constructor args.
 */
export function setAccessControl(_c: ContractBuilder, access: Access): void {
  switch (access) {
    case false:
      break;
    case 'ownable': {
      // if (!c.traitExists('Ownable')) {
      //   c.addUseClause('openzeppelin_stylus::access::ownable', 'Ownable');
      //   c.addImplementedTrait({
      //     name: 'Ownable',
      //     storage: {
      //       name: 'ownable',
      //       type: 'Ownable',
      //     },
      //   });
      // }
      break;
    }
    case 'roles': {
      // if (!c.traitExists('AccessControl')) {
      //   c.addUseClause('alloy_primitives', 'Address');
      //   c.addUseClause('openzeppelin_stylus::access::control', 'AccessControl');
      //   c.addUseClause('openzeppelin_stylus::access::control', 'IAccessControl');
      //   c.addImplementedTrait({
      //     name: 'AccessControl',
      //     storage: {
      //       name: 'access',
      //       type: 'AccessControl',
      //     },
      //   });
      // }
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
  _trait: BaseImplementedTrait,
  _fn: BaseFunction,
  access: Access,
  _roleIdPrefix: string,
  _roleOwner: string | undefined,
): void {
  if (access === false) {
    access = DEFAULT_ACCESS_CONTROL;
  }
  setAccessControl(c, access);

  switch (access) {
    case 'ownable': {
      // c.addFunctionCodeBefore(trait, fn, ['self.ownable.only_owner()?;']);

      break;
    }
    case 'roles': {
      //   const roleId = roleIdPrefix + '_ROLE';
      //   const addedConstant = c.addConstant({
      //     name: roleId,
      //     type: '[u8; 32]',
      //     value: `keccak_const::Keccak256::new().update(b"${roleId}").finalize();`
      //   })
      //   c.addFunctionCodeBefore(trait, fn, [
      //     `self.access.only_role(${roleId}.into())?;`,
      //   ]);

      break;
    }
    default: {
      const _: never = access;
      throw new Error('Unknown value for `access`');
    }
  }
}
