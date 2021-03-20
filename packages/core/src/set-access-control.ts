import type { ContractBuilder, BaseFunction } from './contract';

export const accessOptions = ['ownable', 'roles'] as const;

export type Access = typeof accessOptions[number];

export function setAccessControl(c: ContractBuilder, fn: BaseFunction, access: Access, role: string) {
  switch (access) {
    case 'ownable': {
      c.addParent(parents.Ownable);
      c.addModifier('onlyOwner', fn);
      break;
    }
    case 'roles': {
      const roleId = role + '_ROLE';
      c.addParent(parents.AccessControl);
      c.addVariable(`bytes32 public constant ${roleId} = keccak256("${roleId}");`);
      c.addFunctionCode(`require(hasRole(${roleId}, msg.sender));`, fn);
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
