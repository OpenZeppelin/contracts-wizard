import { withImplicitArgs } from './common-options';
import type { ContractBuilder, BaseFunction } from './contract';
import { defineFunctions } from './utils/define-functions';
import { defineModules } from './utils/define-modules';

export const accessOptions = [false, 'ownable', 'roles'] as const;

export type Access = typeof accessOptions[number];

/**
 * Sets access control for the contract by adding inheritance.
 */
 export function setAccessControl(c: ContractBuilder, access: Access) {
  switch (access) {
    case 'ownable': {
      c.addModule(modules.Ownable, [{ lit:'owner' }], [], true);
      c.addConstructorArgument({ name: 'owner', type: 'felt'});
      
      c.addFunction(functions.transferOwnership);
      c.addFunction(functions.renounceOwnership);
      break;
    }
    case 'roles': {
      if (c.addModule(modules.AccessControl)) {
        c.addConstructorArgument({ name: 'admin', type: 'felt'});
        c.addConstructorCode('AccessControl._grant_role(DEFAULT_ADMIN_ROLE, admin)');  
      }
      // if (c.addParent(parents.AccessControl)) {
      //   c.addConstructorCode('_grantRole(DEFAULT_ADMIN_ROLE, msg.sender);');
      // }
      // c.addOverride(parents.AccessControl.name, supportsInterface);
      break;
    }
  }
}

/**
 * Enables access control for the contract and restricts the given function with access control.
 */
export function requireAccessControl(c: ContractBuilder, fn: BaseFunction, access: Access, role: string) {
  if (access === false) {
    access = 'ownable';
  }
  
  setAccessControl(c, access);

  switch (access) {
    case 'ownable': {
      c.addLibraryCall(functions.assert_only_owner, fn);
      break;
    }
    case 'roles': {
      const roleId = role + '_ROLE';
      // if (c.addVariable(`bytes32 public constant ${roleId} = keccak256("${roleId}");`)) {
      //   c.addConstructorCode(`_grantRole(${roleId}, msg.sender);`);
      // }
      c.addConstructorCode(`AccessControl._grant_role(${roleId}, admin)`);

      c.addLibraryCall(functions.assert_only_role, fn, [roleId]);
      break;
    }
  }
}

const modules = defineModules( {
  Ownable: {
    path: 'openzeppelin/access/ownable',
    useNamespace: true
  },
  AccessControl: {
    path: 'openzeppelin/access/accesscontrol',
    useNamespace: true
  }
})

const functions = defineFunctions({
  // --- library-only calls ---
  assert_only_owner: {
    module: modules.Ownable,
    args: [],
  },

  assert_only_role: {
    module: modules.AccessControl,
    args: []
  },

  // --- external functions ---

  transferOwnership: {
    module: modules.Ownable,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'newOwner', type: 'felt' },
    ],
    parentFunctionName: 'transfer_ownership',
  },

  renounceOwnership: {
    module: modules.Ownable,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [],
    parentFunctionName: 'renounce_ownership',
  },

});