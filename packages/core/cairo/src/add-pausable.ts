import { getSelfArg } from './common-options';
import type { ContractBuilder } from './contract';
import type { Access } from './set-access-control';
import { requireAccessControl } from './set-access-control';
import { defineFunctions } from './utils/define-functions';
import { defineComponents } from './utils/define-components';
import { externalTrait } from './external-trait';

export function addPausable(c: ContractBuilder, access: Access) {
  c.addComponent(components.PausableComponent, [], false);

  c.addFunction(externalTrait, functions.pause);
  c.addFunction(externalTrait, functions.unpause);
  requireAccessControl(c, externalTrait, functions.pause, access, 'PAUSER', 'pauser');
  requireAccessControl(c, externalTrait, functions.unpause, access, 'PAUSER', 'pauser');
}

const components = defineComponents({
  PausableComponent: {
    path: 'openzeppelin::security::pausable',
    substorage: {
      name: 'pausable',
      type: 'PausableComponent::Storage',
    },
    event: {
      name: 'PausableEvent',
      type: 'PausableComponent::Event',
    },
    impls: [
      {
        name: 'PausableImpl',
        value: 'PausableComponent::PausableImpl<ContractState>',
      },
      {
        name: 'PausableInternalImpl',
        embed: false,
        value: 'PausableComponent::InternalImpl<ContractState>',
      },
    ],
  },
});

const functions = defineFunctions({
  pause: {
    args: [getSelfArg()],
    code: ['self.pausable.pause()'],
  },
  unpause: {
    args: [getSelfArg()],
    code: ['self.pausable.unpause()'],
  },
});
