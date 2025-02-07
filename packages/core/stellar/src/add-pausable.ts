import { getSelfArg } from './common-options';
import type { ContractBuilder } from './contract';
import { Access } from './set-access-control';
import { defineFunctions } from './utils/define-functions';
import { defineComponents } from './utils/define-components';
import { externalTrait } from './external-trait';

export function addPausable(c: ContractBuilder, access: Access) {
  // c.addComponent(components.PausableComponent, [], false);


  c.addFunction(externalTrait, functions.pause);
  c.addFunction(externalTrait, functions.unpause);
  // requireAccessControl(c, externalTrait, functions.pause, access, 'PAUSER', 'pauser');
  // requireAccessControl(c, externalTrait, functions.unpause, access, 'PAUSER', 'pauser');


  // c.addFunctionCodeBefore(fungibleMintableTrait, functions.mint, 'let owner: Address = e.storage().instance().get(&OWNER).expect("owner should be set")');
  // c.addFunctionCodeBefore(fungibleMintableTrait, functions.mint, 'owner.require_auth();');

}

const components = defineComponents( {
  PausableComponent: {
    path: 'openzeppelin_pausable',
    substorage: {
      name: 'pausable',
      type: 'PausableComponent::Storage',
    },
    event: {
      name: 'PausableEvent',
      type: 'PausableComponent::Event',
    },
    impls: [{
        name: 'PausableImpl',
        value: 'PausableComponent::PausableImpl<ContractState>',
      }, {
        name: 'PausableInternalImpl',
        embed: false,
        value: 'PausableComponent::InternalImpl<ContractState>',
      }
    ],
  },
});

const functions = defineFunctions({
  pause: {
    args: [
      getSelfArg(),
    ],
    code: [
      'self.pausable.pause()'
    ]
  },
  unpause: {
    args: [
      getSelfArg(),
    ],
    code: [
      'self.pausable.unpause()'
    ]
  },
});

