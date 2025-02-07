import { getSelfArg } from './common-options';
import type { ContractBuilder } from './contract';
import { Access } from './set-access-control';
import { defineFunctions } from './utils/define-functions';

export function addPausable(c: ContractBuilder, name: string, access: Access) {
  const pausableTrait = {
    name: 'Pausable',
    for: name,
    tags: [
      'contractimpl',
    ],
  };

  c.addFunction(pausableTrait, functions.paused);
  c.addFunction(pausableTrait, functions.pause);
  c.addFunction(pausableTrait, functions.unpause);

  c.addUseClause('soroban_sdk', 'Address');
  c.addUseClause('soroban_sdk', 'panic_with_error');
  c.addError('Unauthorized', 1); // TODO: Ensure there are no conflicts in error codes
  const checkOwner = [
    'let owner: Address = e.storage().instance().get(&OWNER).expect("owner should be set");',
    'if owner != caller {',
    `    panic_with_error!(e, ${name}Error::Unauthorized)`,
    '}',
  ];
  c.addFunctionCodeBefore(pausableTrait, functions.pause, checkOwner);
  c.addFunctionCodeBefore(pausableTrait, functions.unpause, checkOwner);

  // requireAccessControl(c, externalTrait, functions.pause, access, 'PAUSER', 'pauser');
  // requireAccessControl(c, externalTrait, functions.unpause, access, 'PAUSER', 'pauser');
}

const functions = defineFunctions({
  paused: {
    args: [
      getSelfArg(),
    ],
    returns: 'bool',
    code: [
      'pausable::paused(e)'
    ],
  },
  pause: {
    args: [
      getSelfArg(),
      { name: 'caller', type: 'Address' },
    ],
    code: [
      'pausable::pause(e, &caller)'
    ],
  },
  unpause: {
    args: [
      getSelfArg(),
      { name: 'caller', type: 'Address' },
    ],
    code: [
      'pausable::unpause(e, &caller)'
    ],
  },
});