import { getSelfArg } from './common-options';
import type { BaseImplementedTrait, ContractBuilder } from './contract';
import type { Access } from './set-access-control';
import { requireAccessControl } from './set-access-control';
import { defineComponents } from './utils/define-components';
import { defineFunctions } from './utils/define-functions';
import type { Account } from './account';

export const upgradeableOptions = [false, true] as const;

export type Upgradeable = (typeof upgradeableOptions)[number];

function setUpgradeableBase(c: ContractBuilder, upgradeable: Upgradeable): BaseImplementedTrait | undefined {
  if (upgradeable === false) {
    return undefined;
  }

  c.upgradeable = true;

  c.addComponent(components.UpgradeableComponent, [], false);

  c.addUseClause('openzeppelin::upgrades::interface', 'IUpgradeable');
  c.addUseClause('starknet', 'ClassHash');

  const t: BaseImplementedTrait = {
    name: 'UpgradeableImpl',
    of: 'IUpgradeable<ContractState>',
    section: 'Upgradeable',
    tags: ['abi(embed_v0)'],
  };
  c.addImplementedTrait(t);

  return t;
}

export function setUpgradeable(c: ContractBuilder, upgradeable: Upgradeable, access: Access): void {
  const trait = setUpgradeableBase(c, upgradeable);
  if (trait !== undefined) {
    requireAccessControl(c, trait, functions.upgrade, access, 'UPGRADER', 'upgrader');
  }
}

export function setUpgradeableGovernor(c: ContractBuilder, upgradeable: Upgradeable): void {
  const trait = setUpgradeableBase(c, upgradeable);
  if (trait !== undefined) {
    c.addUseClause('openzeppelin::governance::governor::GovernorComponent', 'InternalExtendedImpl');
    c.addFunctionCodeBefore(trait, functions.upgrade, 'self.governor.assert_only_governance()');
  }
}

export function setAccountUpgradeable(c: ContractBuilder, upgradeable: Upgradeable, type: Account): void {
  const trait = setUpgradeableBase(c, upgradeable);
  if (trait !== undefined) {
    switch (type) {
      case 'stark':
        c.addFunctionCodeBefore(trait, functions.upgrade, 'self.account.assert_only_self()');
        break;
      case 'eth':
        c.addFunctionCodeBefore(trait, functions.upgrade, 'self.eth_account.assert_only_self()');
        break;
    }
  }
}

const components = defineComponents({
  UpgradeableComponent: {
    path: 'openzeppelin::upgrades',
    substorage: {
      name: 'upgradeable',
      type: 'UpgradeableComponent::Storage',
    },
    event: {
      name: 'UpgradeableEvent',
      type: 'UpgradeableComponent::Event',
    },
    impls: [
      {
        name: 'UpgradeableInternalImpl',
        embed: false,
        value: 'UpgradeableComponent::InternalImpl<ContractState>',
      },
    ],
  },
});

const functions = defineFunctions({
  upgrade: {
    args: [getSelfArg(), { name: 'new_class_hash', type: 'ClassHash' }],
    code: ['self.upgradeable.upgrade(new_class_hash)'],
  },
});
