import { withImplicitArgs } from './common-options';
import type { ContractBuilder, BaseFunction } from './contract';
import { Access, setAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';

export function addPausable(c: ContractBuilder, access: Access, pausableFns: BaseFunction[]) {
  c.addParentLibrary({
    prefix: 'Pausable',
    path: 'openzeppelin/security/pausable',    
  }, [], ['Pausable_pause', 'Pausable_unpause', 'Pausable_when_not_paused'], false);

  for (const fn of pausableFns) {
    setPausable(c, fn);
  }

  c.addFunction(functions.paused);

  setAccessControl(c, functions.pause, access);
  setAccessControl(c, functions.unpause, access);
}

const functions = defineFunctions({

  paused: {
    module: 'Pausable',
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [],
    returns: [{ name: 'paused', type: 'felt' }],
    passthrough: true,
    read: true
  },

  pause: {
    module: 'Pausable',
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [],
  },

  unpause: {
    module: 'Pausable',
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [],
  },
  
});

export function setPausable(c: ContractBuilder, fn: BaseFunction) {
    // TODO add these base functions to parent imports automatically
    c.addLibraryCall('Pausable_when_not_paused()', fn);
}
