import type { ContractBuilder, BaseFunction } from './contract';
import { supportsInterface } from './common-functions';

export const accessOptions = [false, 'ownable', 'roles'] as const;

export type Access = typeof accessOptions[number];

/**
 * Sets access control for the contract by adding inheritance.
 */
export function setAccessControl(c: ContractBuilder, access: Access) {
  switch (access) {
    case 'ownable': {
      if (c.addParent(parents.Ownable, [ {lit: 'initialOwner'} ])) {
        c.addConstructorArgument({
          type: 'address',
          name: 'initialOwner'
        });
      }
      break;
    }
    case 'roles': {
      if (c.addParent(parents.AccessControl)) {
        c.addConstructorArgument({
          type: 'address',
          name: 'defaultAdmin'
        });
        c.addConstructorCode('_grantRole(DEFAULT_ADMIN_ROLE, defaultAdmin);');
      }
      c.addOverride(parents.AccessControl.name, supportsInterface);
      break;
    }
  }
}

/**
 * Enables access control for the contract and restricts the given function with access control.
 */
export function requireAccessControl(c: ContractBuilder, fn: BaseFunction, access: Access, roleIdPrefix: string, roleOwner: string) {
  if (access === false) {
    access = 'ownable';
  }
  
  setAccessControl(c, access);

  switch (access) {
    case 'ownable': {
      c.addModifier('onlyOwner', fn);
      break;
    }
    case 'roles': {
      const roleId = roleIdPrefix + '_ROLE';
      if (c.addVariable(`bytes32 public constant ${roleId} = keccak256("${roleId}");`)) {
        c.addConstructorArgument({type: 'address', name: roleOwner});
        c.addConstructorCode(`_grantRole(${roleId}, ${roleOwner});`);
      }
      c.addModifier(`onlyRole(${roleId})`, fn);
      break;
    }
  }
}

const parents = {
  Ownable: {
    name: 'Ownable',
    path: '@openzeppelin/contracts/access/Ownable.sol',
    transpiled: true,
  },
  AccessControl: {
    name: 'AccessControl',
    path: '@openzeppelin/contracts/access/AccessControl.sol',
    transpiled: true,
  },
};
