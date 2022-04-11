import type { ContractBuilder, BaseFunction } from './contract';
import { defineFunctions } from './utils/define-functions';
import { defineModules } from './utils/define-modules';

export const accessOptions = ['ownable'] as const;

export type Access = typeof accessOptions[number];

export function setAccessControl(c: ContractBuilder, fn: BaseFunction, access: Access) {
  switch (access) {
    case 'ownable': {
      c.addModule(modules.Ownable, [{ lit:'owner' }], ['Ownable_initializer']);
      c.addConstructorArgument({ name: 'owner', type: 'felt'});
      c.addLibraryCall(functions.only_owner, fn);
      break;
    }
  }
}

const modules = defineModules( {
  Ownable: {
    path: 'openzeppelin/access/ownable',
    usePrefix: true
  },
})

const functions = defineFunctions({
  // --- library-only calls ---
  only_owner: {
    module: modules.Ownable,
    args: [],
  },
});