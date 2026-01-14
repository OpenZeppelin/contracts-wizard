import { getSelfArg } from './common-options';
import type { BaseFunction, ContractBuilder } from './contract';
import type { Access } from './set-access-control';
import { DEFAULT_ACCESS_CONTROL, requireAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';

export function addPausable(c: ContractBuilder, access: Access, explicitImplementations: boolean) {
  c.addUseClause('stellar_contract_utils::pausable', 'self', { alias: 'pausable' });
  c.addUseClause('stellar_contract_utils::pausable', 'Pausable');
  if (!explicitImplementations) c.addUseClause('stellar_macros', 'default_impl');

  const pausableTrait = {
    traitName: 'Pausable',
    structName: c.name,
    tags: ['contractimpl'],
    section: 'Utils',
  };

  const effectiveAccess = access === false ? DEFAULT_ACCESS_CONTROL : access;
  const pauseFn: BaseFunction = effectiveAccess === 'ownable' ? functions.pause_unused_caller : functions.pause;
  const unpauseFn: BaseFunction = effectiveAccess === 'ownable' ? functions.unpause_unused_caller : functions.unpause;

  c.addTraitFunction(pausableTrait, functions.paused);
  c.addTraitFunction(pausableTrait, pauseFn);
  c.addTraitFunction(pausableTrait, unpauseFn);
  requireAccessControl(
    c,
    pausableTrait,
    pauseFn,
    effectiveAccess,
    {
      useMacro: true,
      role: 'pauser',
      caller: 'caller',
    },
    explicitImplementations,
  );

  requireAccessControl(
    c,
    pausableTrait,
    unpauseFn,
    effectiveAccess,
    {
      useMacro: true,
      role: 'pauser',
      caller: 'caller',
    },
    explicitImplementations,
  );
}

const functions = defineFunctions({
  paused: {
    args: [getSelfArg()],
    returns: 'bool',
    code: ['pausable::paused(e)'],
  },
  pause: {
    args: [getSelfArg(), { name: 'caller', type: 'Address' }],
    code: ['pausable::pause(e)'],
  },
  pause_unused_caller: {
    name: 'pause',
    args: [getSelfArg(), { name: '_caller', type: 'Address' }],
    code: ['pausable::pause(e)'],
  },
  unpause: {
    args: [getSelfArg(), { name: 'caller', type: 'Address' }],
    code: ['pausable::unpause(e)'],
  },
  unpause_unused_caller: {
    name: 'unpause',
    args: [getSelfArg(), { name: '_caller', type: 'Address' }],
    code: ['pausable::unpause(e)'],
  },
});
