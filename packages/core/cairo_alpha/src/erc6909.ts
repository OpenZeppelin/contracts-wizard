import type { Contract } from './contract';
import { ContractBuilder } from './contract';
import type { Access } from './set-access-control';
import { DEFAULT_ACCESS_CONTROL, requireAccessControl, setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import type { CommonContractOptions } from './common-options';
import { withCommonContractDefaults, getSelfArg } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { defineComponents } from './utils/define-components';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { addSRC5Component } from './common-components';
import { externalTrait } from './external-trait';

export const defaults: Required<ERC6909Options> = {
  name: 'MyToken',
  burnable: false,
  pausable: false,
  mintable: false,
  contentUri: false,
  tokenSupply: false,
  metadata: false,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info,
  macros: commonDefaults.macros,
} as const;

export function printERC6909(opts: ERC6909Options = defaults): string {
  return printContract(buildERC6909(opts));
}

export interface ERC6909Options extends CommonContractOptions {
  name: string;
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
  contentUri?: boolean;
  tokenSupply?: boolean;
  metadata?: boolean;
}

function withDefaults(opts: ERC6909Options): Required<ERC6909Options> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    mintable: opts.mintable ?? defaults.mintable,
    contentUri: opts.contentUri ?? defaults.contentUri,
    tokenSupply: opts.tokenSupply ?? defaults.tokenSupply,
    metadata: opts.metadata ?? defaults.metadata,
  };
}

export function isAccessControlRequired(opts: Partial<ERC6909Options>): boolean {
  return (
    opts.mintable === true ||
    opts.pausable === true ||
    opts.upgradeable === true ||
    opts.contentUri === true ||
    opts.metadata === true
  );
}

export function buildERC6909(opts: ERC6909Options): Contract {
  const allOpts = withDefaults(opts);
  const c = new ContractBuilder(allOpts.name, allOpts.macros);

  addBase(c);
  addSRC5Component(c);

  if (allOpts.pausable) {
    addPausable(c, allOpts.access);
  }
  if (allOpts.burnable) {
    addBurnable(c);
  }
  if (allOpts.mintable) {
    addMintable(c, allOpts.access);
  }
  if (allOpts.contentUri) {
    addContentURI(c, allOpts.access);
  }
  if (allOpts.tokenSupply) {
    addTokenSupply(c);
  }
  if (allOpts.metadata) {
    addMetadata(c, allOpts.access);
  }

  setAccessControl(c, allOpts.access);
  setUpgradeable(c, allOpts.upgradeable, allOpts.access);
  setInfo(c, allOpts.info);

  addHooks(c, allOpts);

  return c;
}

function addHooks(c: ContractBuilder, allOpts: Required<ERC6909Options>) {
  const usesCustomHooks = allOpts.pausable || allOpts.tokenSupply;
  if (usesCustomHooks) {
    const hooksTrait = {
      name: 'ERC6909HooksImpl',
      of: 'ERC6909Component::ERC6909HooksTrait<ContractState>',
      tags: [],
      priority: 1,
    };
    c.addImplementedTrait(hooksTrait);
    c.addUseClause('starknet', 'ContractAddress');

    const beforeUpdateFnCode = [];
    const needsMutableState = allOpts.tokenSupply;
    const stateLine = needsMutableState 
      ? 'let mut contract_state = self.get_contract_mut();'
      : 'let contract_state = self.get_contract();';
    beforeUpdateFnCode.push(stateLine);
    if (allOpts.pausable) {
      beforeUpdateFnCode.push('contract_state.pausable.assert_not_paused();');
    }
    if (allOpts.tokenSupply) {
      beforeUpdateFnCode.push('contract_state.erc6909_token_supply.update_token_supply(from, recipient, id, amount);');
    }
    c.addFunction(hooksTrait, {
      name: 'before_update',
      args: [
        {
          name: 'ref self',
          type: `ERC6909Component::ComponentState<ContractState>`,
        },
        { name: 'from', type: 'ContractAddress' },
        { name: 'recipient', type: 'ContractAddress' },
        { name: 'id', type: 'u256' },
        { name: 'amount', type: 'u256' },
      ],
      code: beforeUpdateFnCode,
    });
  } else {
    c.addUseClause('openzeppelin_token::erc6909', 'ERC6909HooksEmptyImpl');
  }
}

function addBase(c: ContractBuilder) {
  c.addComponent(components.ERC6909Component, [], true);
}

function addBurnable(c: ContractBuilder) {
  c.addUseClause('starknet', 'ContractAddress');
  c.addUseClause('starknet', 'get_caller_address');
  c.addFunction(externalTrait, functions.burn);
}

function addMintable(c: ContractBuilder, access: Access) {
  c.addUseClause('starknet', 'ContractAddress');
  requireAccessControl(c, externalTrait, functions.mint, access, 'MINTER', 'minter');
}

function addContentURI(c: ContractBuilder, accessObj: Access) {
  const access = { ...accessObj };
  if (access.type === false) {
    access.type = DEFAULT_ACCESS_CONTROL;
  }
  setAccessControl(c, access);
  c.addComponent(components.ERC6909ContentURIComponent, [], true);

  switch (access.type) {
    case 'ownable': {
      c.addImplToComponent(components.ERC6909ContentURIComponent, {
        name: 'ERC6909ContentURIAdminOwnableImpl',
        embed: true,
        value: 'ERC6909ContentURIComponent::ERC6909ContentURIAdminOwnableImpl<ContractState>',
      });
      break;
    }
    case 'roles': {
      c.addImplToComponent(components.ERC6909ContentURIComponent, {
        name: 'ERC6909ContentURIAdminAccessControlImpl',
        embed: true,
        value: 'ERC6909ContentURIComponent::ERC6909ContentURIAdminAccessControlImpl<ContractState>',
      });
      c.addUseClause('starknet', 'ContractAddress');
      c.addConstructorArgument({ name: 'content_uri_admin', type: 'ContractAddress' });
      c.addConstructorCode(
        'self.access_control._grant_role(ERC6909ContentURIComponent::CONTENT_URI_ADMIN_ROLE, content_uri_admin)',
      );
      break;
    }
    case 'roles-dar': {
      c.addImplToComponent(components.ERC6909ContentURIComponent, {
        name: 'ERC6909ContentURIAdminAccessControlDefaultAdminRulesImpl',
        embed: true,
        value: 'ERC6909ContentURIComponent::ERC6909ContentURIAdminAccessControlDefaultAdminRulesImpl<ContractState>',
      });
      c.addUseClause('starknet', 'ContractAddress');
      c.addConstructorArgument({ name: 'content_uri_admin', type: 'ContractAddress' });
      c.addConstructorCode(
        'self.access_control_dar._grant_role(ERC6909ContentURIComponent::CONTENT_URI_ADMIN_ROLE, content_uri_admin)',
      );
      break;
    }
    default: {
      const _: never = access.type;
      throw new Error('Unknown access type');
    }
  }
}

function addTokenSupply(c: ContractBuilder) {
  c.addComponent(components.ERC6909TokenSupplyComponent, [], true);
}

function addMetadata(c: ContractBuilder, accessObj: Access) {
  const access = { ...accessObj };
  if (access.type === false) {
    access.type = DEFAULT_ACCESS_CONTROL;
  }
  setAccessControl(c, access);
  c.addComponent(components.ERC6909MetadataComponent, [], true);

  switch (access.type) {
    case 'ownable': {
      c.addImplToComponent(components.ERC6909MetadataComponent, {
        name: 'ERC6909MetadataAdminOwnableImpl',
        embed: true,
        value: 'ERC6909MetadataComponent::ERC6909MetadataAdminOwnableImpl<ContractState>',
      });
      break;
    }
    case 'roles': {
      c.addImplToComponent(components.ERC6909MetadataComponent, {
        name: 'ERC6909MetadataAdminAccessControlImpl',
        embed: true,
        value: 'ERC6909MetadataComponent::ERC6909MetadataAdminAccessControlImpl<ContractState>',
      });
      c.addUseClause('starknet', 'ContractAddress');
      c.addConstructorArgument({ name: 'metadata_admin', type: 'ContractAddress' });
      c.addConstructorCode(
        'self.access_control._grant_role(ERC6909MetadataComponent::METADATA_ADMIN_ROLE, metadata_admin)',
      );
      break;
    }
    case 'roles-dar': {
      c.addImplToComponent(components.ERC6909MetadataComponent, {
        name: 'ERC6909MetadataAdminAccessControlDefaultAdminRulesImpl',
        embed: true,
        value: 'ERC6909MetadataComponent::ERC6909MetadataAdminAccessControlDefaultAdminRulesImpl<ContractState>',
      });
      c.addUseClause('starknet', 'ContractAddress');
      c.addConstructorArgument({ name: 'metadata_admin', type: 'ContractAddress' });
      c.addConstructorCode(
        'self.access_control_dar._grant_role(ERC6909MetadataComponent::METADATA_ADMIN_ROLE, metadata_admin)',
      );
      break;
    }
    default: {
      const _: never = access.type;
      throw new Error('Unknown access type');
    }
  }
}

const components = defineComponents({
  ERC6909Component: {
    path: 'openzeppelin_token::erc6909',
    substorage: {
      name: 'erc6909',
      type: 'ERC6909Component::Storage',
    },
    event: {
      name: 'ERC6909Event',
      type: 'ERC6909Component::Event',
    },
    impls: [
      {
        name: 'ERC6909Impl',
        embed: true,
        value: 'ERC6909Component::ERC6909Impl<ContractState>',
      },
      {
        name: 'ERC6909InternalImpl',
        embed: false,
        value: 'ERC6909Component::InternalImpl<ContractState>',
      },
    ],
  },
  ERC6909ContentURIComponent: {
    path: 'openzeppelin_token::erc6909::extensions',
    substorage: {
      name: 'erc6909_content_uri',
      type: 'ERC6909ContentURIComponent::Storage',
    },
    event: {
      name: 'ERC6909ContentURIEvent',
      type: 'ERC6909ContentURIComponent::Event',
    },
    impls: [
      {
        name: 'ERC6909ContentURIImpl',
        embed: true,
        value: 'ERC6909ContentURIComponent::ERC6909ContentURIImpl<ContractState>',
      },
      {
        name: 'ERC6909ContentURIInternalImpl',
        embed: false,
        value: 'ERC6909ContentURIComponent::InternalImpl<ContractState>',
      },
    ],
  },
  ERC6909TokenSupplyComponent: {
    path: 'openzeppelin_token::erc6909::extensions',
    substorage: {
      name: 'erc6909_token_supply',
      type: 'ERC6909TokenSupplyComponent::Storage',
    },
    event: {
      name: 'ERC6909TokenSupplyEvent',
      type: 'ERC6909TokenSupplyComponent::Event',
    },
    impls: [
      {
        name: 'ERC6909TokenSupplyImpl',
        embed: true,
        value: 'ERC6909TokenSupplyComponent::ERC6909TokenSupplyImpl<ContractState>',
      },
      {
        name: 'ERC6909TokenSupplyInternalImpl',
        embed: false,
        value: 'ERC6909TokenSupplyComponent::InternalImpl<ContractState>',
      },
    ],
  },
  ERC6909MetadataComponent: {
    path: 'openzeppelin_token::erc6909::extensions',
    substorage: {
      name: 'erc6909_metadata',
      type: 'ERC6909MetadataComponent::Storage',
    },
    event: {
      name: 'ERC6909MetadataEvent',
      type: 'ERC6909MetadataComponent::Event',
    },
    impls: [
      {
        name: 'ERC6909MetadataImpl',
        embed: true,
        value: 'ERC6909MetadataComponent::ERC6909MetadataImpl<ContractState>',
      },
      {
        name: 'ERC6909MetadataInternalImpl',
        embed: false,
        value: 'ERC6909MetadataComponent::InternalImpl<ContractState>',
      },
    ],
  },
});

const functions = defineFunctions({
  burn: {
    args: [
      getSelfArg(),
      { name: 'account', type: 'ContractAddress' },
      { name: 'id', type: 'u256' },
      { name: 'amount', type: 'u256' },
    ],
    code: [
      'let caller = get_caller_address();',
      'if account != caller {',
      '    assert(self.erc6909.is_operator(account, caller), ERC6909Component::Errors::INSUFFICIENT_ALLOWANCE)',
      '}',
      'self.erc6909.burn(account, id, amount);',
    ],
  },
  mint: {
    args: [
      getSelfArg(),
      { name: 'account', type: 'ContractAddress' },
      { name: 'id', type: 'u256' },
      { name: 'amount', type: 'u256' },
    ],
    code: ['self.erc6909.mint(account, id, amount);'],
  },
});
