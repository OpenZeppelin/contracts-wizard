import type { ContractBuilder, BaseFunction } from './contract';
import { supportsInterface } from './common-functions';

export const accessOptions = [false, 'ownable', 'roles'] as const;

export type Access = typeof accessOptions[number];

/**
 * Sets access control for the contract by adding inheritance.
 */
export function setAccessControlForContract(c: ContractBuilder, access: Access) {
  switch (access) {
    case 'ownable': {
      c.addParent(parents.Ownable);
      break;
    }
    case 'roles': {
      if (c.addParent(parents.AccessControl)) {
        c.addConstructorCode('_grantRole(DEFAULT_ADMIN_ROLE, msg.sender);');
      }
      c.addOverride(parents.AccessControl.name, supportsInterface);
      break;
    }
  }
}

/**
 * Enables access control for the contract and restricts the given function with access control.
 */
export function enableAccessControl(c: ContractBuilder, fn: BaseFunction, access: Access, role: string) {
  if (access === false) {
    access = 'ownable';
  }
  
  setAccessControlForContract(c, access);

  switch (access) {
    case 'ownable': {
      c.addModifier('onlyOwner', fn);
      break;
    }
    case 'roles': {
      const roleId = role + '_ROLE';
      if (c.addVariable(`bytes32 public constant ${roleId} = keccak256("${roleId}");`)) {
        c.addConstructorCode(`_grantRole(${roleId}, msg.sender);`);
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
  },
  AccessControl: {
    name: 'AccessControl',
    path: '@openzeppelin/contracts/access/AccessControl.sol',
  },
};
