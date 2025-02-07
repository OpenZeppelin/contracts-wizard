import { getSelfArg } from './common-options';
import type { ContractBuilder } from './contract';
import { Access } from './set-access-control';
import { defineFunctions } from './utils/define-functions';
// import { defineComponents } from './utils/define-components';
import { externalTrait } from './external-trait';

export function addPausable(c: ContractBuilder, name: string, access: Access) {
  // c.addComponent(components.PausableComponent, [], false);

  const pausableTrait = {
    name: 'Pausable',
    for: name,
    tags: [
      '#[contractimpl]',
    ],
  };

  c.addFunction(pausableTrait, functions.paused);
  c.addFunction(pausableTrait, functions.pause);
  c.addFunction(pausableTrait, functions.unpause);

  c.addUseClause('soroban_sdk', 'Address');
  c.addUseClause('soroban_sdk', 'panic_with_error');
  const checkOwner = [
    'let owner: Address = e.storage().instance().get(&OWNER).expect("owner should be set");',
    'if owner != caller {',
    `    panic_with_error!(e, ${name}Error::Unauthorized)`,
    '}',
  ];
  c.addFunctionCodeBefore(pausableTrait, functions.pause, checkOwner);
  c.addFunctionCodeBefore(pausableTrait, functions.unpause, checkOwner);


  // c.addFunctionCodeBefore(pausableTrait, functions.pause, 'let owner: Address = e.storage().instance().get(&OWNER).expect("owner should be set");');
  // c.addFunctionCodeBefore(pausableTrait, functions.pause, 'owner.require_auth();');

  // c.addFunction(externalTrait, functions.pause);
  // c.addFunction(externalTrait, functions.unpause);
  // requireAccessControl(c, externalTrait, functions.pause, access, 'PAUSER', 'pauser');
  // requireAccessControl(c, externalTrait, functions.unpause, access, 'PAUSER', 'pauser');


  // c.addFunctionCodeBefore(fungibleMintableTrait, functions.mint, 'let owner: Address = e.storage().instance().get(&OWNER).expect("owner should be set")');
  // c.addFunctionCodeBefore(fungibleMintableTrait, functions.mint, 'owner.require_auth();');

}

// const components = defineComponents( {
//   PausableComponent: {
//     path: 'openzeppelin_pausable',
//     substorage: {
//       name: 'pausable',
//       type: 'PausableComponent::Storage',
//     },
//     event: {
//       name: 'PausableEvent',
//       type: 'PausableComponent::Event',
//     },
//     impls: [{
//         name: 'PausableImpl',
//         value: 'PausableComponent::PausableImpl<ContractState>',
//       }, {
//         name: 'PausableInternalImpl',
//         embed: false,
//         value: 'PausableComponent::InternalImpl<ContractState>',
//       }
//     ],
//   },
// });

const functions = defineFunctions({
  // pause: {
  //   args: [
  //     getSelfArg(),
  //   ],
  //   code: [
  //     'self.pausable.pause()'
  //   ]
  // },
  // unpause: {
  //   args: [
  //     getSelfArg(),
  //   ],
  //   code: [
  //     'self.pausable.unpause()'
  //   ]
  // },

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