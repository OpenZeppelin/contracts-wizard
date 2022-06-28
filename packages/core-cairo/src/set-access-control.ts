import { withImplicitArgs } from './common-options';
import type { ContractBuilder, BaseFunction } from './contract';
import { defineFunctions } from './utils/define-functions';
import { defineModules } from './utils/define-modules';

export const accessOptions = [false, 'ownable'] as const;

export type Access = typeof accessOptions[number];

/**
 * Sets access control for the contract by adding inheritance.
 */
 export function setAccessControlForContract(c: ContractBuilder, access: Access) {
  switch (access) {
    case 'ownable': {
      c.addModule(modules.Ownable, [{ lit:'owner' }], [], true);
      c.addConstructorArgument({ name: 'owner', type: 'felt'});
      
      c.addFunction(functions.transferOwnership);
      c.addFunction(functions.renounceOwnership);
      break;
    }
  }
}

/**
 * Enables access control for the contract and restricts the given function with access control.
 */
export function requireAccessControl(c: ContractBuilder, fn: BaseFunction, access: Access) {
  if (access === false) {
    access = 'ownable';
  }
  
  setAccessControlForContract(c, access);

  switch (access) {
    case 'ownable': {
      c.addLibraryCall(functions.assert_only_owner, fn);
      break;
    }
  }
}

const modules = defineModules( {
  Ownable: {
    path: 'openzeppelin/access/ownable',
    useNamespace: true
  },
})

const functions = defineFunctions({
  // --- library-only calls ---
  assert_only_owner: {
    module: modules.Ownable,
    args: [],
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