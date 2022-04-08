import type { ContractBuilder, BaseFunction } from './contract';
import { defineModules } from './utils/define-modules';

export const accessOptions = ['ownable'] as const;

export type Access = typeof accessOptions[number];

export function setAccessControl(c: ContractBuilder, fn: BaseFunction, access: Access) {
  switch (access) {
    case 'ownable': {
      c.addParentLibrary(modules.Ownable, [{ lit:'owner' }], ['Ownable_initializer', 'Ownable_only_owner']);
      c.addConstructorArgument({ name: 'owner', type: 'felt'});
      c.addLibraryCall('Ownable_only_owner()', fn); // TODO make this add something in the parent
      break;
    }
  }
}

const modules = defineModules( {
  Ownable: {
    path: 'openzeppelin/access/ownable',
  },
})

