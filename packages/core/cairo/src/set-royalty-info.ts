import type { BaseImplementedTrait, ContractBuilder } from './contract';
import { defineComponents } from './utils/define-components';
import { OptionsError } from './error';
import { toUint } from './utils/convert-strings';
import type { Access } from './set-access-control';
import { setAccessControl, DEFAULT_ACCESS_CONTROL } from './set-access-control';

const DEFAULT_FEE_DENOMINATOR = BigInt(10_000);

export const defaults: RoyaltyInfoOptions = {
  enabled: false,
  defaultRoyaltyFraction: '0',
  feeDenominator: DEFAULT_FEE_DENOMINATOR.toString(),
};

export const royaltyInfoOptions = {
  disabled: defaults,
  enabledDefault: {
    enabled: true,
    defaultRoyaltyFraction: '500',
    feeDenominator: DEFAULT_FEE_DENOMINATOR.toString(),
  },
  enabledCustom: {
    enabled: true,
    defaultRoyaltyFraction: '15125',
    feeDenominator: '100000',
  },
};

export type RoyaltyInfoOptions = {
  enabled: boolean;
  defaultRoyaltyFraction: string;
  feeDenominator: string;
};

export function setRoyaltyInfo(c: ContractBuilder, options: RoyaltyInfoOptions, access: Access): void {
  if (!options.enabled) {
    return;
  }
  if (access === false) {
    access = DEFAULT_ACCESS_CONTROL;
  }
  setAccessControl(c, access);

  const { defaultRoyaltyFraction, feeDenominator } = getRoyaltyParameters(options);
  const initParams = [{ lit: 'default_royalty_receiver' }, defaultRoyaltyFraction];

  c.addComponent(components.ERC2981Component, initParams, true);
  c.addUseClause('starknet', 'ContractAddress');
  c.addConstructorArgument({
    name: 'default_royalty_receiver',
    type: 'ContractAddress',
  });

  switch (access) {
    case 'ownable':
      c.addImplToComponent(components.ERC2981Component, {
        name: 'ERC2981AdminOwnableImpl',
        value: `ERC2981Component::ERC2981AdminOwnableImpl<ContractState>`,
      });
      break;
    case 'roles':
      c.addImplToComponent(components.ERC2981Component, {
        name: 'ERC2981AdminAccessControlImpl',
        value: `ERC2981Component::ERC2981AdminAccessControlImpl<ContractState>`,
      });
      c.addConstructorArgument({
        name: 'royalty_admin',
        type: 'ContractAddress',
      });
      c.addConstructorCode('self.accesscontrol._grant_role(ERC2981Component::ROYALTY_ADMIN_ROLE, royalty_admin)');
      break;
  }

  if (feeDenominator === DEFAULT_FEE_DENOMINATOR) {
    c.addUseClause('openzeppelin::token::common::erc2981', 'DefaultConfig');
  } else {
    const trait: BaseImplementedTrait = {
      name: 'ERC2981ImmutableConfig',
      of: 'ERC2981Component::ImmutableConfig',
      tags: [],
    };
    c.addImplementedTrait(trait);
    c.addSuperVariableToTrait(trait, {
      name: 'FEE_DENOMINATOR',
      type: 'u128',
      value: feeDenominator.toString(),
    });
  }
}

function getRoyaltyParameters(opts: Required<RoyaltyInfoOptions>): {
  defaultRoyaltyFraction: bigint;
  feeDenominator: bigint;
} {
  const feeDenominator = toUint(opts.feeDenominator, 'feeDenominator', 'u128');
  if (feeDenominator === BigInt(0)) {
    throw new OptionsError({
      feeDenominator: 'Must be greater than 0',
    });
  }
  const defaultRoyaltyFraction = toUint(opts.defaultRoyaltyFraction, 'defaultRoyaltyFraction', 'u128');
  if (defaultRoyaltyFraction > feeDenominator) {
    throw new OptionsError({
      defaultRoyaltyFraction: 'Cannot be greater than fee denominator',
    });
  }
  return { defaultRoyaltyFraction, feeDenominator };
}

const components = defineComponents({
  ERC2981Component: {
    path: 'openzeppelin::token::common::erc2981',
    substorage: {
      name: 'erc2981',
      type: 'ERC2981Component::Storage',
    },
    event: {
      name: 'ERC2981Event',
      type: 'ERC2981Component::Event',
    },
    impls: [
      {
        name: 'ERC2981Impl',
        value: 'ERC2981Component::ERC2981Impl<ContractState>',
      },
      {
        name: 'ERC2981InfoImpl',
        value: 'ERC2981Component::ERC2981InfoImpl<ContractState>',
      },
      {
        name: 'ERC2981InternalImpl',
        value: 'ERC2981Component::InternalImpl<ContractState>',
        embed: false,
      },
    ],
  },
});
