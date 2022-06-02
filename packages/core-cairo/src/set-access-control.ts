import type { ContractBuilder, BaseFunction } from './contract';
import { defineFunctions } from './utils/define-functions';
import { defineModules } from './utils/define-modules';
import { defineNamespaces } from './utils/define-namespaces';

export const accessOptions = ['ownable'] as const;

export type Access = typeof accessOptions[number];

export function setAccessControl(c: ContractBuilder, fn: BaseFunction, access: Access) {
  switch (access) {
    case 'ownable': {
      c.addModule(modules.Ownable, [{ lit:'owner' }], [], true, namespaces.Ownable);
      c.addConstructorArgument({ name: 'owner', type: 'felt'});
      c.addLibraryCall(functions.assert_only_owner, fn);
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

const namespaces = defineNamespaces( {
  Ownable: {
    module: modules.Ownable,
  },
})

const functions = defineFunctions({
  // --- library-only calls ---
  assert_only_owner: {
    module: modules.Ownable,
    namespace: namespaces.Ownable,
    args: [],
  },
});