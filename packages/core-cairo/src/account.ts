import { BaseImplementedTrait, Contract, ContractBuilder } from './contract';
import { Access, requireAccessControl, setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults, getSelfArg } from './common-options';
import { defaults as commonDefaults } from './common-options';
import { setUpgradeable, setAccountUpgradeable, Upgradeable } from './set-upgradeable';
import { setInfo, Info } from './set-info';
import { defineComponents } from './utils/define-components';
//import { defaults as commonDefaults } from './common-options';
import { defaults as infoDefaults } from "./set-info";
import { printContract } from './print';
import { addSRC5Component } from './common-components';
import { externalTrait } from './external-trait';
import { toByteArray } from './utils/convert-strings';


export const accountOptions = ['stark', 'eth'] as const;

export type Account = typeof accountOptions[number];

export const defaults: Required<AccountOptions> = {
    name: 'MyAccount',
    type: 'stark',
    declare: true,
    deploy: true,
    pubkey: true,
    access: commonDefaults.access,
    upgradeable: commonDefaults.upgradeable,
    info: commonDefaults.info
  } as const;
  
  export function printAccount(opts: AccountOptions = defaults): string {
    return printContract(buildAccount(opts));
  }
  
  export interface AccountOptions extends CommonOptions {
    name: string;
    type: Account;
    declare: boolean,
    deploy: boolean,
    pubkey: boolean
  }
  
  function withDefaults(opts: AccountOptions): Required<AccountOptions> {
    return {
      ...opts,
      ...withCommonDefaults(opts),
      type: opts.type ?? defaults.type,
      declare: opts.declare ?? defaults.declare,
      deploy: opts.deploy ?? defaults.deploy,
      pubkey: opts.pubkey ?? defaults.pubkey
    };
  }
  
  export function isAccessControlRequired(opts: Partial<AccountOptions>): boolean {
    return opts.upgradeable === false;
  }

export function buildAccount(opts: AccountOptions): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);
  if (opts.type === 'stark') {
    c.addConstructorArgument({ name:'public_key', type:'felt252' });
    c.addConstructorCode('self.account.initializer(public_key)');

    if (opts.declare && opts.deploy && opts.pubkey) {
        addAccountMixin(c)
    } else {
        addSRC6(c)

        if (opts.declare) {
            addDeclarer(c)
        }

        if (opts.deploy) {
            addDeployer(c)
        }

        if (opts.pubkey) {
            addPublicKey(c)
        }
    }
  } else {
    c.addStandaloneImport('openzeppelin::account::interface::EthPublicKey;');
    c.addConstructorArgument({ name:'recipient', type:'EthPublicKey' });
    c.addConstructorCode('self.eth_account.initializer(public_key)');

    if (opts.declare && opts.deploy && opts.pubkey) {
        addEthAccountMixin(c)
    } else {
        addEthSRC6(c)

        if (opts.declare) {
            addEthDeclarer(c)
        }

        if (opts.deploy) {
            addEthDeployer(c)
        }

        if (opts.pubkey) {
            addEthPublicKey(c)
        }
    }
  }

  //setAccessControl(c, allOpts.access);
  //setUpgradeable(c, allOpts.upgradeable, allOpts.access);
  setAccountUpgradeable(c, allOpts.upgradeable);
  setInfo(c, allOpts.info);

  return c;
}

function addSRC6(c: ContractBuilder) {
    c.addImplToComponent(components.AccountComponent, {
        name: 'SRC6Impl',
        value: 'AccountComponent::SRC6Impl<ContractState>',
      });
      c.addInterfaceFlag('ISRC5');
      addSRC5Component(c);
}

function addEthSRC6(c: ContractBuilder) {
    c.addImplToComponent(components.EthAccountComponent, {
        name: 'SRC6Impl',
        value: 'EthAccountComponent::SRC6Impl<ContractState>',
      });
      c.addInterfaceFlag('ISRC5');
      addSRC5Component(c);
}

function addDeclarer(c: ContractBuilder) {
    c.addImplToComponent(components.AccountComponent, {
        name: 'DeclarerImpl',
        value: 'AccountComponent::DeclarerImpl<ContractState>',
      });
}

function addEthDeclarer(c: ContractBuilder) {
    c.addImplToComponent(components.EthAccountComponent, {
        name: 'DeclarerImpl',
        value: 'EthAccountComponent::DeclarerImpl<ContractState>',
      });
}

function addDeployer(c: ContractBuilder) {
    c.addImplToComponent(components.AccountComponent, {
        name: 'DeployerImpl',
        value: 'AccountComponent::DeployerImpl<ContractState>',
      });
}

function addEthDeployer(c: ContractBuilder) {
    c.addImplToComponent(components.EthAccountComponent, {
        name: 'DeployerImpl',
        value: 'EthAccountComponent::DeployerImpl<ContractState>',
      });
}

function addPublicKey(c: ContractBuilder) {
    c.addImplToComponent(components.AccountComponent, {
        name: 'PublicKeyImpl',
        value: 'AccountComponent::PublicKeyImpl<ContractState>',
      });
}

function addEthPublicKey(c: ContractBuilder) {
    c.addImplToComponent(components.EthAccountComponent, {
        name: 'PublicKeyImpl',
        value: 'EthAccountComponent::PublicKeyImpl<ContractState>',
      });
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
