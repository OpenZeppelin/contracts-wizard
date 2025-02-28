import type { BaseFunction, BaseImplementedTrait, ContractBuilder } from './contract';
import { defineComponents } from './utils/define-components';
import { addSRC5Component } from './common-components';

export const accessOptions = [false, 'ownable', 'roles'] as const;
export const DEFAULT_ACCESS_CONTROL = 'ownable';

export type Access = (typeof accessOptions)[number];

/**
 * Sets access control for the contract by adding inheritance.
 */
export function setAccessControl(c: ContractBuilder, access: Access): void {
  switch (access) {
    case 'ownable': {
      c.addComponent(components.OwnableComponent, [{ lit: 'owner' }], true);

      c.addUseClause('starknet', 'ContractAddress');
      c.addConstructorArgument({ name: 'owner', type: 'ContractAddress' });

      break;
    }
    case 'roles': {
      if (c.addComponent(components.AccessControlComponent, [], true)) {
        if (c.interfaceFlags.has('ISRC5')) {
          c.addImplToComponent(components.AccessControlComponent, {
            name: 'AccessControlImpl',
            value: 'AccessControlComponent::AccessControlImpl<ContractState>',
          });
          c.addImplToComponent(components.AccessControlComponent, {
            name: 'AccessControlCamelImpl',
            value: 'AccessControlComponent::AccessControlCamelImpl<ContractState>',
          });
        } else {
          c.addImplToComponent(components.AccessControlComponent, {
            name: 'AccessControlMixinImpl',
            value: 'AccessControlComponent::AccessControlMixinImpl<ContractState>',
          });
          c.addInterfaceFlag('ISRC5');
        }
        addSRC5Component(c);

        c.addUseClause('starknet', 'ContractAddress');
        c.addConstructorArgument({
          name: 'default_admin',
          type: 'ContractAddress',
        });

        c.addUseClause('openzeppelin::access::accesscontrol', 'DEFAULT_ADMIN_ROLE');
        c.addConstructorCode('self.accesscontrol._grant_role(DEFAULT_ADMIN_ROLE, default_admin)');
      }
      break;
    }
  }
}

/**
 * Enables access control for the contract and restricts the given function with access control.
 */
export function requireAccessControl(
  c: ContractBuilder,
  trait: BaseImplementedTrait,
  fn: BaseFunction,
  access: Access,
  roleIdPrefix: string,
  roleOwner: string | undefined,
): void {
  if (access === false) {
    access = DEFAULT_ACCESS_CONTROL;
  }
  setAccessControl(c, access);

  switch (access) {
    case 'ownable': {
      c.addFunctionCodeBefore(trait, fn, 'self.ownable.assert_only_owner()');
      break;
    }
    case 'roles': {
      const roleId = roleIdPrefix + '_ROLE';
      const addedSuper = c.addSuperVariable({
        name: roleId,
        type: 'felt252',
        value: `selector!("${roleId}")`,
      });
      if (roleOwner !== undefined) {
        c.addUseClause('starknet', 'ContractAddress');
        c.addConstructorArgument({ name: roleOwner, type: 'ContractAddress' });
        if (addedSuper) {
          c.addConstructorCode(`self.accesscontrol._grant_role(${roleId}, ${roleOwner})`);
        }
      }

      c.addFunctionCodeBefore(trait, fn, `self.accesscontrol.assert_only_role(${roleId})`);

      break;
    }
  }
}

const components = defineComponents({
  OwnableComponent: {
    path: 'openzeppelin::access::ownable',
    substorage: {
      name: 'ownable',
      type: 'OwnableComponent::Storage',
    },
    event: {
      name: 'OwnableEvent',
      type: 'OwnableComponent::Event',
    },
    impls: [
      {
        name: 'OwnableMixinImpl',
        value: 'OwnableComponent::OwnableMixinImpl<ContractState>',
      },
      {
        name: 'OwnableInternalImpl',
        embed: false,
        value: 'OwnableComponent::InternalImpl<ContractState>',
      },
    ],
  },
  AccessControlComponent: {
    path: 'openzeppelin::access::accesscontrol',
    substorage: {
      name: 'accesscontrol',
      type: 'AccessControlComponent::Storage',
    },
    event: {
      name: 'AccessControlEvent',
      type: 'AccessControlComponent::Event',
    },
    impls: [
      {
        name: 'AccessControlInternalImpl',
        embed: false,
        value: 'AccessControlComponent::InternalImpl<ContractState>',
      },
    ],
  },
});
