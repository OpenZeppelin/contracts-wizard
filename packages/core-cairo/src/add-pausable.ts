import { withImplicitArgs } from './common-options';
import type { ContractBuilder, BaseFunction } from './contract';
import { Access, setAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';
import { defineModules } from './utils/define-modules';

export function addPausable(c: ContractBuilder, access: Access, pausableFns: BaseFunction[]) {
  c.addModule(modules.Pausable, [], ['Pausable_pause', 'Pausable_unpause', 'Pausable_when_not_paused'], false);

  for (const fn of pausableFns) {
    setPausable(c, fn);
  }

  c.addFunction(functions.paused);

  setAccessControl(c, functions.pause, access);
  setAccessControl(c, functions.unpause, access);
}

const modules = defineModules( {
  Pausable: {
    path: 'openzeppelin/security/pausable', 
    usePrefix: true
  },
});

const functions = defineFunctions({

  paused: {
    module: modules.Pausable,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [],
    returns: [{ name: 'paused', type: 'felt' }],
    passthrough: true,
    read: true
  },

  pause: {
    module: modules.Pausable,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [],
  },

  unpause: {
    module: modules.Pausable,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [],
  },
  
});

export function setPausable(c: ContractBuilder, fn: BaseFunction) {
    // TODO add these base functions to parent imports automatically
    c.addLibraryCall('Pausable_when_not_paused()', fn);
}
