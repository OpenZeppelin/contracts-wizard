import { getSelfArg } from './common-options';
import type { ContractBuilder } from './contract';
import type { Access } from './set-access-control';
import { requireAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';

export function addPausable(c: ContractBuilder, access: Access) {
  c.addUseClause('openzeppelin_pausable', 'self', { alias: 'pausable' });
  c.addUseClause('openzeppelin_pausable', 'Pausable');

  const pausableTrait = {
    name: 'Pausable',
    for: c.name,
    tags: ['contractimpl'],
    section: 'Utils',
  };

  c.addFunction(pausableTrait, functions.paused);
  c.addFunction(pausableTrait, functions.pause);
  c.addFunction(pausableTrait, functions.unpause);

  requireAccessControl(c, pausableTrait, functions.pause, access, 'caller');
  requireAccessControl(c, pausableTrait, functions.unpause, access, 'caller');
}

const functions = defineFunctions({
  paused: {
    args: [getSelfArg()],
    returns: 'bool',
    code: ['pausable::paused(e)'],
  },
  pause: {
    args: [getSelfArg(), { name: 'caller', type: 'Address' }],
    code: ['pausable::pause(e, &caller)'],
  },
  unpause: {
    args: [getSelfArg(), { name: 'caller', type: 'Address' }],
    code: ['pausable::unpause(e, &caller)'],
  },
});
