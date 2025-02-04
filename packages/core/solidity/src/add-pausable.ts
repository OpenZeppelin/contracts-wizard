import type { ContractBuilder, BaseFunction } from './contract';
import { Access, requireAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';

export function addPausable(c: ContractBuilder, access: Access, pausableFns: BaseFunction[]) {
  c.addParent({
    name: 'Pausable',
    path: '@openzeppelin/contracts/utils/Pausable.sol',
  });

  for (const fn of pausableFns) {
    c.addModifier('whenNotPaused', fn);
  }

  addPauseFunctions(c, access);
}

export function addPauseFunctions(c: ContractBuilder, access: Access) {
  requireAccessControl(c, functions.pause, access, 'PAUSER', 'pauser');
  c.addFunctionCode('_pause();', functions.pause);

  requireAccessControl(c, functions.unpause, access, 'PAUSER', 'pauser');
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
