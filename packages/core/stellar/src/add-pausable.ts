import { getSelfArg } from './common-options';
import type { ContractBuilder } from './contract';
import type { Access } from './set-access-control';
import { requireAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';

export function addPausable(c: ContractBuilder, access: Access) {
  c.addUseClause('stellar_pausable', 'self', { alias: 'pausable' });
  c.addUseClause('stellar_pausable', 'Pausable');
  c.addUseClause('stellar_default_impl_macro', 'default_impl');

  const pausableTrait = {
    traitName: 'Pausable',
    structName: c.name,
    tags: ['contractimpl'],
    section: 'Utils',
  };

  c.addTraitFunction(pausableTrait, functions.paused);
  c.addTraitFunction(pausableTrait, functions.pause);
  c.addTraitFunction(pausableTrait, functions.unpause);

  requireAccessControl(c, pausableTrait, functions.pause, access, { useMacro: true, role: 'pauser', caller: 'caller' });
  requireAccessControl(c, pausableTrait, functions.unpause, access, {
    useMacro: true,
    role: 'pauser',
    caller: 'caller',
  });
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
