import type { BaseFunction, BaseImplementedTrait, ContractBuilder } from './contract';
import { defineComponents } from './utils/define-components';
import { addSRC5Component } from './common-components';
import { durationToSeconds } from './utils/duration';
import { OptionsError } from './error';
import { toUint } from './utils/convert-strings';

export type AccessType =
  | false
  | 'ownable'
  | 'roles' // AccessControl
  | 'roles-dar'; // AccessControlDefaultAdminRules

export type RolesDefaultAdminRulesOptions = {
  darInitialDelay: string;
  darDefaultDelayIncrease: string;
  darMaxTransferDelay: string;
};

export type Access = { type: AccessType } & RolesDefaultAdminRulesOptions;

export const darDefaultOpts: RolesDefaultAdminRulesOptions = {
  darInitialDelay: '1 day',
  darDefaultDelayIncrease: '5 days',
  darMaxTransferDelay: '30 days',
};

export const darCustomOpts: RolesDefaultAdminRulesOptions = {
  darInitialDelay: '2 days',
  darDefaultDelayIncrease: '1 week',
  darMaxTransferDelay: '2 weeks',
};

type AccessControlFactory = {
  readonly None: () => Readonly<{ type: false } & typeof darDefaultOpts>;
  readonly Ownable: () => Readonly<{ type: 'ownable' } & typeof darDefaultOpts>;
  readonly Roles: () => Readonly<{ type: 'roles' } & typeof darDefaultOpts>;
  readonly RolesDefaultAdminRules: (
    opts: RolesDefaultAdminRulesOptions,
  ) => Readonly<{ type: 'roles-dar' } & RolesDefaultAdminRulesOptions>;
};

export const AccessControl = {
  None: () => ({ type: false, ...darDefaultOpts }) as const,
  Ownable: () => ({ type: 'ownable', ...darDefaultOpts }) as const,
  Roles: () => ({ type: 'roles', ...darDefaultOpts }) as const,
  RolesDefaultAdminRules: (opts: RolesDefaultAdminRulesOptions) => ({ type: 'roles-dar', ...opts }) as const,
} as const satisfies AccessControlFactory;

export const DEFAULT_ACCESS_CONTROL = 'ownable';

export type AccessSubset = 'all' | 'disabled' | 'ownable' | 'roles' | 'roles-dar-default' | 'roles-dar-custom';

export function resolveAccessControlOptions(subset: AccessSubset): Access[] {
  switch (subset) {
    case 'all':
      return [
        AccessControl.None(),
        AccessControl.Ownable(),
        AccessControl.Roles(),
        AccessControl.RolesDefaultAdminRules(darDefaultOpts),
        AccessControl.RolesDefaultAdminRules(darCustomOpts),
      ];
    case 'disabled':
      return [AccessControl.None()];
    case 'ownable':
      return [AccessControl.Ownable()];
    case 'roles':
      return [AccessControl.Roles()];
    case 'roles-dar-default':
      return [AccessControl.RolesDefaultAdminRules(darDefaultOpts)];
    case 'roles-dar-custom':
      return [AccessControl.RolesDefaultAdminRules(darCustomOpts)];
    default: {
      const _: never = subset;
      throw new Error('Unknown AccessControlSubset');
    }
  }
}

const DEFAULT_ADMIN_DELAY_INCREASE_WAIT = BigInt(5 * 24 * 60 * 60); // 5 days
const MAXIMUM_DEFAULT_ADMIN_TRANSFER_DELAY = BigInt(30 * 24 * 60 * 60); // 30 days

/// Sets access control for the contract by adding inheritance.
export function setAccessControl(c: ContractBuilder, access: Access): void {
  switch (access.type) {
    case false: {
      break;
    }
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
            embed: true,
            value: 'AccessControlComponent::AccessControlImpl<ContractState>',
          });
          c.addImplToComponent(components.AccessControlComponent, {
            name: 'AccessControlCamelImpl',
            embed: true,
            value: 'AccessControlComponent::AccessControlCamelImpl<ContractState>',
          });
          c.addImplToComponent(components.AccessControlComponent, {
            name: 'AccessControlWithDelayImpl',
            embed: true,
            value: 'AccessControlComponent::AccessControlWithDelayImpl<ContractState>',
          });
        } else {
          c.addImplToComponent(components.AccessControlComponent, {
            name: 'AccessControlMixinImpl',
            embed: true,
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

        c.addUseClause('openzeppelin_access::accesscontrol', 'DEFAULT_ADMIN_ROLE');
        c.addConstructorCode('self.access_control._grant_role(DEFAULT_ADMIN_ROLE, default_admin)');
      }
      break;
    }
    case 'roles-dar': {
      const initParams = [{ lit: 'INITIAL_DELAY' }, { lit: 'initial_default_admin' }];
      if (c.addComponent(components.AccessControlDefaultAdminRulesComponent, initParams, true)) {
        if (c.interfaceFlags.has('ISRC5')) {
          c.addImplToComponent(components.AccessControlDefaultAdminRulesComponent, {
            name: 'AccessControlImpl',
            embed: true,
            value: 'AccessControlDefaultAdminRulesComponent::AccessControlImpl<ContractState>',
          });
          c.addImplToComponent(components.AccessControlDefaultAdminRulesComponent, {
            name: 'AccessControlDefaultAdminRulesImpl',
            embed: true,
            value: 'AccessControlDefaultAdminRulesComponent::AccessControlDefaultAdminRulesImpl<ContractState>',
          });
          c.addImplToComponent(components.AccessControlDefaultAdminRulesComponent, {
            name: 'AccessControlCamelImpl',
            embed: true,
            value: 'AccessControlDefaultAdminRulesComponent::AccessControlCamelImpl<ContractState>',
          });
          c.addImplToComponent(components.AccessControlDefaultAdminRulesComponent, {
            name: 'AccessControlWithDelayImpl',
            embed: true,
            value: 'AccessControlDefaultAdminRulesComponent::AccessControlWithDelayImpl<ContractState>',
          });
        } else {
          c.addImplToComponent(components.AccessControlDefaultAdminRulesComponent, {
            name: 'AccessControlMixinImpl',
            embed: true,
            value: 'AccessControlDefaultAdminRulesComponent::AccessControlMixinImpl<ContractState>',
          });
          c.addInterfaceFlag('ISRC5');
        }
        addSRC5Component(c);
        const initialDelay = toUint(getInitialDelay(access), 'darInitialDelay', 'u64');
        c.addConstant({
          name: 'INITIAL_DELAY',
          type: 'u64',
          value: initialDelay.toString(),
          comment: access.darInitialDelay,
          inlineComment: true,
        });
        const defaultAdminDelayIncreaseWait = toUint(
          getDefaultAdminDelayIncreaseWait(access),
          'darDefaultDelayIncrease',
          'u64',
        );
        const maxDefaultAdminTransferDelay = toUint(
          getDefaultAdminMaxTransferDelay(access),
          'darMaxTransferDelay',
          'u64',
        );
        const shouldUseDefaultConfig =
          defaultAdminDelayIncreaseWait === DEFAULT_ADMIN_DELAY_INCREASE_WAIT &&
          maxDefaultAdminTransferDelay === MAXIMUM_DEFAULT_ADMIN_TRANSFER_DELAY;
        if (shouldUseDefaultConfig) {
          c.addUseClause('openzeppelin_access::accesscontrol::extensions', 'DefaultConfig', {
            alias: 'AccessControlDefaultAdminRulesDefaultConfig',
          });
        } else {
          const trait: BaseImplementedTrait = {
            name: 'AccessControlDefaultAdminRulesImmutableConfig',
            of: 'AccessControlDefaultAdminRulesComponent::ImmutableConfig',
            tags: [],
          };
          c.addImplementedTrait(trait);
          c.addSuperVariableToTrait(trait, {
            name: 'DEFAULT_ADMIN_DELAY_INCREASE_WAIT',
            type: 'u64',
            value: defaultAdminDelayIncreaseWait.toString(),
            comment: access.darDefaultDelayIncrease,
            inlineComment: true,
          });
          c.addSuperVariableToTrait(trait, {
            name: 'MAXIMUM_DEFAULT_ADMIN_TRANSFER_DELAY',
            type: 'u64',
            value: maxDefaultAdminTransferDelay.toString(),
            comment: access.darMaxTransferDelay,
            inlineComment: true,
          });
        }

        c.addUseClause('starknet', 'ContractAddress');
        c.addConstructorArgument({ name: 'initial_default_admin', type: 'ContractAddress' });
      }
      break;
    }
    default: {
      const _: never = access.type;
      throw new Error('Unknown access type');
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
  accessObj: Access,
  roleIdPrefix: string,
  roleOwner: string | undefined,
): void {
  const access = { ...accessObj }; // make a copy to avoid mutating caller-supplied object
  if (access.type === false) {
    access.type = DEFAULT_ACCESS_CONTROL;
  }
  setAccessControl(c, access);

  switch (access.type) {
    case 'ownable': {
      c.addFunctionCodeBefore(trait, fn, 'self.ownable.assert_only_owner()');
      break;
    }
    case 'roles':
    case 'roles-dar': {
      const roleId = roleIdPrefix + '_ROLE';
      const addedSuper = c.addSuperVariable({
        name: roleId,
        type: 'felt252',
        value: `selector!("${roleId}")`,
      });
      const substorageName =
        access.type === 'roles-dar'
          ? components.AccessControlDefaultAdminRulesComponent.substorage.name
          : components.AccessControlComponent.substorage.name;
      if (roleOwner !== undefined) {
        c.addUseClause('starknet', 'ContractAddress');
        c.addConstructorArgument({ name: roleOwner, type: 'ContractAddress' });
        if (addedSuper) {
          c.addConstructorCode(`self.${substorageName}._grant_role(${roleId}, ${roleOwner})`);
        }
      }

      c.addFunctionCodeBefore(trait, fn, `self.${substorageName}.assert_only_role(${roleId})`);

      break;
    }
    default: {
      const _: never = access.type;
      throw new Error('Unknown access type');
    }
  }
}

function getInitialDelay(opts: RolesDefaultAdminRulesOptions): number {
  try {
    return durationToSeconds(opts.darInitialDelay);
  } catch (e) {
    if (e instanceof Error) {
      throw new OptionsError({
        darInitialDelay: e.message,
      });
    } else {
      throw e;
    }
  }
}

function getDefaultAdminDelayIncreaseWait(opts: RolesDefaultAdminRulesOptions): number {
  try {
    return durationToSeconds(opts.darDefaultDelayIncrease);
  } catch (e) {
    if (e instanceof Error) {
      throw new OptionsError({
        darDefaultDelayIncrease: e.message,
      });
    } else {
      throw e;
    }
  }
}

function getDefaultAdminMaxTransferDelay(opts: RolesDefaultAdminRulesOptions): number {
  try {
    return durationToSeconds(opts.darMaxTransferDelay);
  } catch (e) {
    if (e instanceof Error) {
      throw new OptionsError({
        darMaxTransferDelay: e.message,
      });
    } else {
      throw e;
    }
  }
}

const components = defineComponents({
  OwnableComponent: {
    path: 'openzeppelin_access::ownable',
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
        embed: true,
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
    path: 'openzeppelin_access::accesscontrol',
    substorage: {
      name: 'access_control',
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
  AccessControlDefaultAdminRulesComponent: {
    path: 'openzeppelin_access::accesscontrol::extensions',
    substorage: {
      name: 'access_control_dar',
      type: 'AccessControlDefaultAdminRulesComponent::Storage',
    },
    event: {
      name: 'AccessControlDefaultAdminRulesEvent',
      type: 'AccessControlDefaultAdminRulesComponent::Event',
    },
    impls: [
      {
        name: 'AccessControlDefaultAdminRulesInternalImpl',
        embed: false,
        value: 'AccessControlDefaultAdminRulesComponent::InternalImpl<ContractState>',
      },
    ],
  },
});
