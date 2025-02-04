import type { ContractBuilder, BaseFunction } from './contract';
import { supportsInterface } from './common-functions';

export const accessOptions = [false, 'ownable', 'roles', 'managed'] as const;

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
      c.addOverride(parents.AccessControl, supportsInterface);
      break;
    }
    case 'managed': {
      if (c.addParent(parents.AccessManaged, [ {lit: 'initialAuthority'} ])) {
        c.addConstructorArgument({
          type: 'address',
          name: 'initialAuthority'
        });
      }
      break;
    }
  }
}

/**
 * Enables access control for the contract and restricts the given function with access control.
 */
export function requireAccessControl(c: ContractBuilder, fn: BaseFunction, access: Access, roleIdPrefix: string, roleOwner: string | undefined) {
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
      const addedConstant = c.addVariable(`bytes32 public constant ${roleId} = keccak256("${roleId}");`);
      if (roleOwner && addedConstant) {
        c.addConstructorArgument({type: 'address', name: roleOwner});
        c.addConstructorCode(`_grantRole(${roleId}, ${roleOwner});`);
      }
      c.addModifier(`onlyRole(${roleId})`, fn);
      break;
    }
    case 'managed': {
      c.addModifier('restricted', fn);
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
  AccessManaged: {
    name: 'AccessManaged',
    path: '@openzeppelin/contracts/access/manager/AccessManaged.sol',
  },
};
