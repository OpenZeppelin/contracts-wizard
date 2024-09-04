import { BaseImplementedTrait, Contract, ContractBuilder } from './contract';
import { Access, requireAccessControl, setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { getSelfArg } from './common-options';
import { setUpgradeable, setAccountUpgradeable, Upgradeable } from './set-upgradeable';
import { setInfo, Info } from './set-info';
import { defineComponents } from './utils/define-components';
//import { defaults as commonDefaults } from './common-options';
import { defaults as infoDefaults } from "./set-info";
import { printContract } from './print';
import { addSRC5Component } from './common-components';
import { externalTrait } from './external-trait';
import { toByteArray } from './utils/convert-strings';


export const accountOptions = ['stark', 'secp256k1'] as const;

export type Account = typeof accountOptions[number];


export const accountDefaults: Required<AccountOptions> = {
    name: "MyAccount",
    type: 'stark',
    upgradeable: true,
    info: infoDefaults,
  } as const;
  
  export interface AccountOptions {
    name: string,
    type: Account,
    upgradeable: Upgradeable;
    info: Info;
  }

export function printAccount(opts: AccountOptions = accountDefaults): string {
  return printContract(buildAccount(opts));
}

function withDefaults(opts: AccountOptions): Required<AccountOptions> {
  return {
    ...opts,
    ...accountDefaults
  };
}

export function isAccessControlRequired(opts: Partial<AccountOptions>): boolean {
  return false;
}

export function buildAccount(opts: AccountOptions): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  if (opts.type === 'stark') {
    addAccountMixin(c)
  } else {
    addEthAccountMixin(c)
  }

  //setAccessControl(c, allOpts.access);
  //setUpgradeable(c, allOpts.upgradeable, allOpts.access);
  setAccountUpgradeable(c, allOpts.upgradeable);
  setInfo(c, allOpts.info);

  return c;
}

function addAccountMixin(c: ContractBuilder) {
  c.addImplToComponent(components.AccountComponent, {
    name: 'AccountMixinImpl',
    value: 'AccountComponent::AccountMixinImpl<ContractState>',
  });
  c.addInterfaceFlag('ISRC5');
  addSRC5Component(c);
}

function addEthAccountMixin(c: ContractBuilder) {
    c.addImplToComponent(components.EthAccountComponent, {
      name: 'EthAccountMixinImpl',
      value: 'EthAccountComponent::EthAccountMixinImpl<ContractState>',
    });
    c.addInterfaceFlag('ISRC5');
    addSRC5Component(c);
  }

//function addBase(c: ContractBuilder, public_key: string) {
//  //c.addComponent(
//  //  components.AccountComponent,
//  //  [
//  //      public_key
//  //  ],
//  //  true,
//  //);
//  c.addConstructorArgument({ name:'public_key', type:'felt252' });
//
//}

const components = defineComponents( {
  AccountComponent: {
    path: 'openzeppelin::token::account',
    substorage: {
      name: 'account',
      type: 'AccountComponent::Storage',
    },
    event: {
      name: 'AccountEvent',
      type: 'AccountComponent::Event',
    },
    impls: [],
    internalImpl: {
      name: 'AccountInternalImpl',
      value: 'AccountComponent::InternalImpl<ContractState>',
    },
  },
  EthAccountComponent: {
    path: 'openzeppelin::token::eth_account',
    substorage: {
      name: 'eth_account',
      type: 'EthAccountComponent::Storage',
    },
    event: {
      name: 'EthAccountEvent',
      type: 'EthAccountComponent::Event',
    },
    impls: [],
    internalImpl: {
      name: 'EthAccountInternalImpl',
      value: 'EthAccountComponent::InternalImpl<ContractState>',
    },
  },
});
