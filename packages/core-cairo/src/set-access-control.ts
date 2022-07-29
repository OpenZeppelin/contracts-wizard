import { withImplicitArgs } from './common-options';
import type { ContractBuilder, BaseFunction } from './contract';
import { defineFunctions } from './utils/define-functions';
import { defineModules } from './utils/define-modules';
import { keccak256 } from 'ethereum-cryptography/keccak';
import { utf8ToBytes, bytesToHex } from 'ethereum-cryptography/utils';

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
        importDefaultAdminRole(c);

        c.addConstructorArgument({ name: 'admin', type: 'felt'});
        c.addConstructorCode('AccessControl._grant_role(DEFAULT_ADMIN_ROLE, admin)');

        c.addFunction(functions.hasRole);
        c.addFunction(functions.getRoleAdmin);
        c.addFunction(functions.grantRole);
        c.addFunction(functions.revokeRole);
        c.addFunction(functions.renounceRole);
      }
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
      if (c.addVariable(`const ${roleId} = ${to251BitHash(roleId)} # keccak256('${roleId}')[0:251 bits]`)) {
        c.addConstructorCode(`AccessControl._grant_role(${roleId}, admin)`);
      }

      c.addLibraryCall(functions.assert_only_role, fn, [roleId]);
      break;
    }
  }
}

export function to251BitHash(label: string): string {
  const hash = bytesToHex(keccak256(utf8ToBytes(label)));
  const bin = BigInt('0x' + hash).toString(2).substring(0, 251);
  const hex = BigInt('0b' + bin).toString(16);
  return '0x' + hex;
}

function importDefaultAdminRole(c: ContractBuilder) {
  c.addModule(modules.constants, [], [], false);
  c.addModuleFunction(modules.constants, 'DEFAULT_ADMIN_ROLE');
}

const modules = defineModules( {
  Ownable: {
    path: 'openzeppelin.access.ownable.library',
    useNamespace: true
  },
  AccessControl: {
    path: 'openzeppelin.access.accesscontrol.library',
    useNamespace: true
  },
  constants: {
    path: 'openzeppelin.utils.constants.library',
    useNamespace: false
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
    kind: 'external',
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'newOwner', type: 'felt' },
    ],
    parentFunctionName: 'transfer_ownership',
  },

  renounceOwnership: {
    module: modules.Ownable,
    kind: 'external',
    implicitArgs: withImplicitArgs(),
    args: [],
    parentFunctionName: 'renounce_ownership',
  },

  hasRole: {
    module: modules.AccessControl,
    kind: 'view',
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'role', type: 'felt' },
      { name: 'user', type: 'felt' },
    ],
    parentFunctionName: 'has_role',
    returns: [{ name: 'has_role', type: 'felt' }],
    passthrough: true,
  },

  getRoleAdmin: {
    module: modules.AccessControl,
    kind: 'view',
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'role', type: 'felt' },
    ],
    parentFunctionName: 'get_role_admin',
    returns: [{ name: 'admin', type: 'felt' }],
    passthrough: true,
  },

  grantRole: {
    module: modules.AccessControl,
    kind: 'external',
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'role', type: 'felt' },
      { name: 'user', type: 'felt' },
    ],
    parentFunctionName: 'grant_role',
  },

  revokeRole: {
    module: modules.AccessControl,
    kind: 'external',
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'role', type: 'felt' },
      { name: 'user', type: 'felt' },
    ],
    parentFunctionName: 'revoke_role',
  },

  renounceRole: {
    module: modules.AccessControl,
    kind: 'external',
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'role', type: 'felt' },
      { name: 'user', type: 'felt' },
    ],
    parentFunctionName: 'renounce_role',
  },

});