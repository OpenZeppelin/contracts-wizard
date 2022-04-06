import type { ContractBuilder, BaseFunction } from './contract';

export const accessOptions = ['ownable'] as const;

export type Access = typeof accessOptions[number];

export function setAccessControl(c: ContractBuilder, fn: BaseFunction, access: Access) {
  switch (access) {
    case 'ownable': {
      c.addParentLibrary(parents.Ownable, [{ lit:'owner' }], ['Ownable_initializer', 'Ownable_only_owner']);
      c.addConstructorArgument({ name: 'owner', type: 'felt'});
      c.addLibraryCall('Ownable_only_owner()', fn); // TODO make this add something in the parent
      break;
    }
  }
}

const parents = {
  Ownable: {
    prefix: 'Ownable',
    modulePath: 'openzeppelin/access/ownable',
  },
};
