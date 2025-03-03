import { getSelfArg } from './common-options';
import type { BaseImplementedTrait, ContractBuilder } from './contract';
import type { Access } from './set-access-control';
import { requireAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';

export function addPausable(c: ContractBuilder, access: Access) {
  c.addUseClause('alloc::vec', 'Vec');

  const pausableTrait: BaseImplementedTrait = {
    name: 'Pausable',
    storage: {
      name: 'pausable',
      type: 'Pausable',
    },
    modulePath: 'openzeppelin_stylus::utils',
  };

  c.addFunction(pausableTrait, functions.pause);
  c.addFunction(pausableTrait, functions.unpause);

  requireAccessControl(c, pausableTrait, functions.pause, access, 'PAUSER', 'pauser');
  requireAccessControl(c, pausableTrait, functions.unpause, access, 'PAUSER', 'pauser');
}

const functions = defineFunctions({
  pause: {
    args: [getSelfArg()],
    returns: 'Result<(), Vec<u8>>',
    code: ['self.pausable.pause().map_err(|e| e.into())'],
  },
  unpause: {
    args: [getSelfArg()],
    returns: 'Result<(), Vec<u8>>',
    code: ['self.pausable.unpause().map_err(|e| e.into())'],
  },
});
