import type { Contract } from './contract';
import { ContractBuilder } from './contract';
import type { CommonOptions } from './common-options';
import { withCommonDefaults } from './common-options';
import { defaults as commonDefaults } from './common-options';
import { setAccountUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { defineComponents } from './utils/define-components';
import { printContract } from './print';
import { addSRC5Component } from './common-components';

export const accountTypes = ['stark', 'eth'] as const;
export type Account = (typeof accountTypes)[number];

export const defaults: Required<AccountOptions> = {
  name: 'MyAccount',
  type: 'stark',
  declare: true,
  deploy: true,
  pubkey: true,
  outsideExecution: true,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info,
} as const;

export function printAccount(opts: AccountOptions = defaults): string {
  return printContract(buildAccount(opts));
}

export interface AccountOptions extends CommonOptions {
  name: string;
  type: Account;
  declare?: boolean;
  deploy?: boolean;
  pubkey?: boolean;
  outsideExecution?: boolean;
}

function withDefaults(opts: AccountOptions): Required<AccountOptions> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    declare: opts.declare ?? defaults.declare,
    deploy: opts.deploy ?? defaults.deploy,
    pubkey: opts.pubkey ?? defaults.pubkey,
    outsideExecution: opts.outsideExecution ?? defaults.outsideExecution,
  };
}

export function buildAccount(opts: AccountOptions): Contract {
  const isAccount = true;
  const c = new ContractBuilder(opts.name, isAccount);

  const allOpts = withDefaults(opts);

  switch (allOpts.type) {
    case 'stark':
      c.addConstructorArgument({ name: 'public_key', type: 'felt252' });
      c.addComponent(components.AccountComponent, [{ lit: 'public_key' }], true);
      break;
    case 'eth':
      c.addUseClause('openzeppelin::account::interface', 'EthPublicKey');
      c.addConstructorArgument({ name: 'public_key', type: 'EthPublicKey' });
      c.addComponent(components.EthAccountComponent, [{ lit: 'public_key' }], true);
      break;
  }

  if (allOpts.declare && allOpts.deploy && allOpts.pubkey) {
    addAccountMixin(c, allOpts.type);
  } else {
    addSRC6(c, allOpts.type);

    if (allOpts.declare) {
      addDeclarer(c, allOpts.type);
    }

    if (allOpts.deploy) {
      addDeployer(c, allOpts.type);
    }

    if (allOpts.pubkey) {
      addPublicKey(c, allOpts.type);
    }
  }

  if (allOpts.outsideExecution) {
    addOutsideExecution(c);
  }

  setAccountUpgradeable(c, allOpts.upgradeable, allOpts.type);
  setInfo(c, allOpts.info);

  return c;
}

function addSRC6(c: ContractBuilder, accountType: Account) {
  const [baseComponent, componentType] = getBaseCompAndCompType(accountType);

  c.addImplToComponent(componentType, {
    name: 'SRC6Impl',
    value: `${baseComponent}::SRC6Impl<ContractState>`,
  });
  c.addImplToComponent(componentType, {
    name: 'SRC6CamelOnlyImpl',
    value: `${baseComponent}::SRC6CamelOnlyImpl<ContractState>`,
  });

  addSRC5Component(c);
}

function addDeclarer(c: ContractBuilder, accountType: Account) {
  const [baseComponent, componentType] = getBaseCompAndCompType(accountType);

  c.addImplToComponent(componentType, {
    name: 'DeclarerImpl',
    value: `${baseComponent}::DeclarerImpl<ContractState>`,
  });
}

function addDeployer(c: ContractBuilder, accountType: Account) {
  const [baseComponent, componentType] = getBaseCompAndCompType(accountType);

  c.addImplToComponent(componentType, {
    name: 'DeployableImpl',
    value: `${baseComponent}::DeployableImpl<ContractState>`,
  });
}

function addPublicKey(c: ContractBuilder, accountType: Account) {
  const [baseComponent, componentType] = getBaseCompAndCompType(accountType);

  c.addImplToComponent(componentType, {
    name: 'PublicKeyImpl',
    value: `${baseComponent}::PublicKeyImpl<ContractState>`,
  });
  c.addImplToComponent(componentType, {
    name: 'PublicKeyCamelImpl',
    value: `${baseComponent}::PublicKeyCamelImpl<ContractState>`,
  });
}

function addOutsideExecution(c: ContractBuilder) {
  c.addUseClause('openzeppelin::account::extensions', 'SRC9Component');
  c.addComponent(components.SRC9Component, [], true);
}

function addAccountMixin(c: ContractBuilder, accountType: Account) {
  const accountMixinImpl = accountType === 'stark' ? 'AccountMixinImpl' : 'EthAccountMixinImpl';
  const [baseComponent, componentType] = getBaseCompAndCompType(accountType);

  c.addImplToComponent(componentType, {
    name: `${accountMixinImpl}`,
    value: `${baseComponent}::${accountMixinImpl}<ContractState>`,
  });

  c.addInterfaceFlag('ISRC5');
  addSRC5Component(c);
}

function getBaseCompAndCompType(accountType: Account): [string, typeof componentType] {
  const [baseComponent, componentType] =
    accountType === 'stark'
      ? ['AccountComponent', components.AccountComponent]
      : ['EthAccountComponent', components.EthAccountComponent];
  return [baseComponent, componentType];
}

const components = defineComponents({
  AccountComponent: {
    path: 'openzeppelin::account',
    substorage: {
      name: 'account',
      type: 'AccountComponent::Storage',
    },
    event: {
      name: 'AccountEvent',
      type: 'AccountComponent::Event',
    },
    impls: [
      {
        name: 'AccountInternalImpl',
        embed: false,
        value: 'AccountComponent::InternalImpl<ContractState>',
      },
    ],
  },
  EthAccountComponent: {
    path: 'openzeppelin::account::eth_account',
    substorage: {
      name: 'eth_account',
      type: 'EthAccountComponent::Storage',
    },
    event: {
      name: 'EthAccountEvent',
      type: 'EthAccountComponent::Event',
    },
    impls: [
      {
        name: 'EthAccountInternalImpl',
        embed: false,
        value: 'EthAccountComponent::InternalImpl<ContractState>',
      },
    ],
  },
  SRC9Component: {
    path: 'openzeppelin::account::extensions',
    substorage: {
      name: 'src9',
      type: 'SRC9Component::Storage',
    },
    event: {
      name: 'SRC9Event',
      type: 'SRC9Component::Event',
    },
    impls: [
      {
        name: 'OutsideExecutionV2Impl',
        value: 'SRC9Component::OutsideExecutionV2Impl<ContractState>',
      },
      {
        name: 'OutsideExecutionInternalImpl',
        embed: false,
        value: 'SRC9Component::InternalImpl<ContractState>',
      },
    ],
  },
});
