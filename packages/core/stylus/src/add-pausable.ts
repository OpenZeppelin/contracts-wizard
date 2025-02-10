import { getSelfArg } from './common-options';
import type { ContractBuilder } from './contract';
import { Access, requireAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';

export function addPausable(c: ContractBuilder, access: Access) {
  c.addUseClause('openzeppelin_stylus::utils', 'Pausable');

  const pausableTrait = {
    name: 'Pausable',
    storage: {
      name: 'pausable',
      type: 'Pausable',
    },
    section: 'Pausable', // TODO remove section name if it's not useful
  };

  c.addFunction(pausableTrait, functions.pause);
  c.addFunction(pausableTrait, functions.unpause);

  requireAccessControl(c, pausableTrait, functions.pause, access);
  requireAccessControl(c, pausableTrait, functions.unpause, access);
}

const functions = defineFunctions({
  pause: {
    args: [
      getSelfArg(),
    ],
    returns: 'Result<(), Vec<u8>>',
    visibility: 'pub',
    code: [
      'self.pausable.pause().map_err(|e| e.into())'
    ],
  },
  unpause: {
    args: [
      getSelfArg(),
    ],
    returns: 'Result<(), Vec<u8>>',
    visibility: 'pub',
    code: [
      'self.pausable.unpause().map_err(|e| e.into())'
    ],
  }
});