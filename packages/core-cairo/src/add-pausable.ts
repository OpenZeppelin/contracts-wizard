import { withImplicitArgs } from './common-options';
import type { ContractBuilder, BaseFunction } from './contract';
import { Access, requireAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';
import { defineModules } from './utils/define-modules';

export function addPausable(c: ContractBuilder, access: Access, pausableFns: BaseFunction[]) {
  c.addModule(modules.Pausable, [], [functions.pause, functions.unpause], false);

  for (const fn of pausableFns) {
    setPausable(c, fn);
  }

  c.addFunction(functions.paused);

  requireAccessControl(c, functions.pause, access, 'PAUSER');
  requireAccessControl(c, functions.unpause, access, 'PAUSER');
}

const modules = defineModules( {
  Pausable: {
    path: 'openzeppelin/security/pausable', 
    useNamespace: true
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
    parentFunctionName: 'is_paused',
  },

  pause: {
    module: modules.Pausable,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [],
    parentFunctionName: '_pause',
  },

  unpause: {
    module: modules.Pausable,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [],
    parentFunctionName: '_unpause',
  },

  // --- library-only calls ---

  assert_not_paused: {
    module: modules.Pausable,
    args: [],
  },
  
});

export function setPausable(c: ContractBuilder, fn: BaseFunction) {
    c.addLibraryCall(functions.assert_not_paused, fn);
}
