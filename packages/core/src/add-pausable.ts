import type { ContractBuilder, BaseFunction } from './contract';
import { Access, setAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';

export function addPausable(c: ContractBuilder, access: Access, pausableFns: BaseFunction[]) {
  c.addParent({
    name: 'Pausable',
    path: '@openzeppelin/contracts/security/Pausable.sol',
  });

  for (const fn of pausableFns) {
    c.addModifier('whenNotPaused', fn);
  }

  setAccessControl(c, functions.pause, access, 'PAUSER');
  c.addFunctionCode('_pause();', functions.pause);

  setAccessControl(c, functions.unpause, access, 'PAUSER');
  c.addFunctionCode('_unpause();', functions.unpause);
}

const functions = defineFunctions({
  pause: {
    kind: 'public' as const,
    args: [],
  },

  unpause: {
    kind: 'public' as const,
    args: [],
  },
});
