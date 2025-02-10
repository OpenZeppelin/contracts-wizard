import type { BaseFunction, BaseImplementedTrait, ContractBuilder } from './contract';

export const accessOptions = [false, 'ownable'] as const;
export const DEFAULT_ACCESS_CONTROL = 'ownable';

export type Access = typeof accessOptions[number];

/**
 * Sets access control for the contract via constructor args.
 */
 export function setAccessControl(c: ContractBuilder, access: Access): void {
  switch (access) {
    case false:
      break;
    case 'ownable': {
      if (!c.traitExists('Ownable')) {
        c.addUseClause('openzeppelin_stylus::access::ownable', 'Ownable');
        c.addImplementedTrait({
          name: 'Ownable',
          storage: {
            name: 'ownable',
            type: 'Ownable',
          },
        });
      }
      break;
    }
    default:
      const _: never = access;
      throw new Error('Unknown value for `access`');
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
): void {
  if (access === false) {
    access = DEFAULT_ACCESS_CONTROL;
  }
  setAccessControl(c, access);

  switch (access) {
    case 'ownable': {
      c.addFunctionCodeBefore(trait, fn, [
        'self.ownable.only_owner()?;',
      ]);

      break;
    }
    default:
      const _: never = access;
      throw new Error('Unknown value for `access`');
  }
}
