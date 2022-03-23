import type { ContractBuilder, BaseFunction } from './contract';
// import { supportsInterface } from './common-functions';

export const accessOptions = ['ownable', 'roles'] as const;

export type Access = typeof accessOptions[number];

export function setAccessControl(c: ContractBuilder, fn: BaseFunction, access: Access, role?: string) {
  switch (access) {
    case 'ownable': {
      // c.addLibraryFunction(parents.Ownable, function)


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
