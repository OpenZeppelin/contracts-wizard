import type { BaseFunction, BaseImplementedTrait, ContractBuilder } from './contract';
// import { defineComponents } from './utils/define-components';

export const accessOptions = [false, 'ownable'] as const;
export const DEFAULT_ACCESS_CONTROL = 'ownable';

export type Access = typeof accessOptions[number];

/**
 * Sets access control for the contract by adding inheritance.
 */
 export function setAccessControl(c: ContractBuilder, access: Access): void {
  switch (access) {
    case 'ownable': {
      // c.addComponent(components.OwnableComponent, [{ lit: 'owner' }], true);

      c.addUseClause('starknet', 'ContractAddress');
      c.addConstructorArgument({ name: 'owner', type: 'ContractAddress'});

      break;
    }
  }
}

/**
 * Enables access control for the contract and restricts the given function with access control.
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
      // c.addFunctionCodeBefore(trait, fn, `let owner: Address = e.storage().instance().get(&OWNER).expect("owner should be set");
      //   owner.require_auth();`);
      break;
    }
  }
}
