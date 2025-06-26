import { getSelfArg } from './common-options';
import type { ContractBuilder, ImplementedTrait } from './contract';
import type { Access } from './set-access-control';

export function addPausable(c: ContractBuilder, _access: Access) {
  c.addImplementedTrait(pausableTrait);

  // requireAccessControl(c, pausableTrait, functions.pause, access, 'PAUSER', 'pauser');
  // requireAccessControl(c, pausableTrait, functions.unpause, access, 'PAUSER', 'pauser');
}

const pausableTrait: ImplementedTrait = {
  interface: 'IPausable',
  storage: {
    name: 'pausable',
    type: 'Pausable',
  },
  modulePath: 'openzeppelin_stylus::utils',
  functions: [
    {
      name: 'pause',
      args: [getSelfArg()],
      returns: { ok: '()', err: 'Self::Error' },
      code: 'self.pausable.pause()?',
    },
    {
      name: 'unpause',
      args: [getSelfArg()],
      returns: { ok: '()', err: 'Self::Error' },
      code: 'self.pausable.unpause()?',
    },
  ]
};
