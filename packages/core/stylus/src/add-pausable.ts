import { getSelfArg } from './common-options';
import type { ContractBuilder } from './contract';
import { Access, requireAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';

export function addPausable(c: ContractBuilder, access: Access) {
  c.addUseClause('openzeppelin_pausable', 'self as pausable');
  c.addUseClause('openzeppelin_pausable', 'Pausable');

  const pausableTrait = {
    name: 'Pausable',
    for: c.name,
    tags: [
      'contractimpl',
    ],
    section: 'Pausable', // TODO remove this section name if it's not useful
  };

  c.addFunction(pausableTrait, functions.pause);
  c.addFunction(pausableTrait, functions.unpause);

  // requireAccessControl(c, pausableTrait, functions.pause, access, 'caller');
  // requireAccessControl(c, pausableTrait, functions.unpause, access, 'caller');
}

const functions = defineFunctions({
  pause: {
    args: [
      getSelfArg(),
    ],
    returns: 'Result<(), Vec<u8>>',
    visibility: 'pub',
    code: [
      '/// WARNING: These functions are intended for **testing purposes** only. In',
      '/// **production**, ensure strict access control to prevent unauthorized',
      '/// pausing or unpausing, which can disrupt contract functionality. Remove',
      '/// or secure these functions before deployment.',
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
      '/// WARNING: These functions are intended for **testing purposes** only. In',
      '/// **production**, ensure strict access control to prevent unauthorized',
      '/// pausing or unpausing, which can disrupt contract functionality. Remove',
      '/// or secure these functions before deployment.',
      'self.pausable.unpause().map_err(|e| e.into())'
    ],
  }
});