import { BaseImplementedTrait, Contract, ContractBuilder } from './contract';
import { Access, requireAccessControl, setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults, getSelfArg } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { defineComponents } from './utils/define-components';
import { defaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { addSRC5Component } from './common-components';
import { externalTrait } from './external-trait';
import { toByteArray } from './utils/convert-strings';

export const defaults: Required<ERC1155Options> = {
  name: 'MyToken',
  baseUri: '',
  burnable: false,
  pausable: false,
  mintable: false,
  updatableUri: true,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info
} as const;

export function printERC1155(opts: ERC1155Options = defaults): string {
  return printContract(buildERC1155(opts));
}

export interface ERC1155Options extends CommonOptions {
  name: string;
  baseUri: string;
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
  updatableUri?: boolean;
}

function withDefaults(opts: ERC1155Options): Required<ERC1155Options> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    mintable: opts.mintable ?? defaults.mintable,
    updatableUri: opts.updatableUri ?? defaults.updatableUri,
  };
}

export function isAccessControlRequired(opts: Partial<ERC1155Options>): boolean {
  return opts.mintable === true || opts.pausable === true || opts.updatableUri !== false || opts.upgradeable === true;
}

export function buildERC1155(opts: ERC1155Options): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  addBase(c, toByteArray(allOpts.baseUri));
  addERC1155Mixin(c);

  if (allOpts.pausable) {
    addPausable(c, allOpts.access);
    addPausableHook(c);
  } else {
    c.addStandaloneImport('openzeppelin::token::erc1155::ERC1155HooksEmptyImpl');
  }

  if (allOpts.burnable) {
    addBurnable(c);
  }

  if (allOpts.mintable) {
    addMintable(c, allOpts.access);
  }

  if (allOpts.updatableUri) {
    addSetBaseUri(c, allOpts.access);
  }

  setAccessControl(c, allOpts.access);
  setUpgradeable(c, allOpts.upgradeable, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

function addPausableHook(c: ContractBuilder) {
  const ERC1155HooksTrait: BaseImplementedTrait = {
    name: `ERC1155HooksImpl`,
    of: 'ERC1155Component::ERC1155HooksTrait<ContractState>',
    tags: [],
    priority: 0,
  };
  c.addImplementedTrait(ERC1155HooksTrait);

  c.addStandaloneImport('starknet::ContractAddress');

  c.addFunction(ERC1155HooksTrait, {
    name: 'before_update',
    args: [
      { name: 'ref self', type: `ERC1155Component::ComponentState<ContractState>` },
      { name: 'from', type: 'ContractAddress' },
      { name: 'to', type: 'ContractAddress' },
      { name: 'token_ids', type: 'Span<u256>' },
      { name: 'values', type: 'Span<u256>' },
    ],
    code: [
      'let contract_state = ERC1155Component::HasComponent::get_contract(@self)',
      'contract_state.pausable.assert_not_paused()',
    ],
  });

  c.addFunction(ERC1155HooksTrait, {
    name: 'after_update',
    args: [
      { name: 'ref self', type: `ERC1155Component::ComponentState<ContractState>` },
      { name: 'from', type: 'ContractAddress' },
      { name: 'to', type: 'ContractAddress' },
      { name: 'token_ids', type: 'Span<u256>' },
      { name: 'values', type: 'Span<u256>' },
    ],
    code: [],
  });
}

function addERC1155Mixin(c: ContractBuilder) {
  c.addImplToComponent(components.ERC1155Component, {
    name: 'ERC1155MixinImpl',
    value: 'ERC1155Component::ERC1155MixinImpl<ContractState>',
  });
  c.addInterfaceFlag('ISRC5');
  addSRC5Component(c);
}

function addBase(c: ContractBuilder, baseUri: string) {
  c.addComponent(
    components.ERC1155Component,
    [
      baseUri,
    ],
    true,
  );
}

function addBurnable(c: ContractBuilder) {
  c.addStandaloneImport('starknet::ContractAddress');
  c.addStandaloneImport('starknet::get_caller_address');
  c.addFunction(externalTrait, functions.burn);
  c.addFunction(externalTrait, functions.batch_burn);
  c.addFunction(externalTrait, functions.batchBurn);
}

function addMintable(c: ContractBuilder, access: Access) {
  c.addStandaloneImport('starknet::ContractAddress');
  requireAccessControl(c, externalTrait, functions.mint, access, 'MINTER', 'minter');
  requireAccessControl(c, externalTrait, functions.batch_mint, access, 'MINTER', 'minter');

  // Camel case version of batch_mint. Access control and pausable are already set on batch_mint.
  c.addFunction(externalTrait, functions.batchMint);
}

function addSetBaseUri(c: ContractBuilder, access: Access) {
  requireAccessControl(c, externalTrait, functions.set_base_uri, access, 'URI_SETTER', 'uri_setter');

  // Camel case version of set_base_uri. Access control is already set on set_base_uri.
  c.addFunction(externalTrait, functions.setBaseUri);
}

const components = defineComponents( {
  ERC1155Component: {
    path: 'openzeppelin::token::erc1155',
    substorage: {
      name: 'erc1155',
      type: 'ERC1155Component::Storage',
    },
    event: {
      name: 'ERC1155Event',
      type: 'ERC1155Component::Event',
    },
    impls: [],
    internalImpl: {
      name: 'ERC1155InternalImpl',
      value: 'ERC1155Component::InternalImpl<ContractState>',
    },
  },
});

const functions = defineFunctions({
  burn: {
    args: [
      getSelfArg(),
      { name: 'account', type: 'ContractAddress' },
      { name: 'token_id', type: 'u256' },
      { name: 'value', type: 'u256' },
    ],
    code: [
      'let caller = get_caller_address();',
      'if account != caller {',
      '    assert(self.erc1155.is_approved_for_all(account, caller), ERC1155Component::Errors::UNAUTHORIZED)',
      '}',
      'self.erc1155.burn(account, token_id, value);'
    ]
  },
  batch_burn: {
    args: [
      getSelfArg(),
      { name: 'account', type: 'ContractAddress' },
      { name: 'token_ids', type: 'Span<u256>' },
      { name: 'values', type: 'Span<u256>' },
    ],
    code: [
      'let caller = get_caller_address();',
      'if account != caller {',
      '    assert(self.erc1155.is_approved_for_all(account, caller), ERC1155Component::Errors::UNAUTHORIZED)',
      '}',
      'self.erc1155.batch_burn(account, token_ids, values);'
    ]
  },
  batchBurn: {
    args: [
      getSelfArg(),
      { name: 'account', type: 'ContractAddress' },
      { name: 'tokenIds', type: 'Span<u256>' },
      { name: 'values', type: 'Span<u256>' },
    ],
    code: [
      'self.batch_burn(account, tokenIds, values);'
    ]
  },
  mint: {
    args: [
      getSelfArg(),
      { name: 'account', type: 'ContractAddress' },
      { name: 'token_id', type: 'u256' },
      { name: 'value', type: 'u256' },
      { name: 'data', type: 'Span<felt252>' },
    ],
    code: [
      'self.erc1155.mint_with_acceptance_check(account, token_id, value, data);',
    ]
  },
  batch_mint: {
    args: [
      getSelfArg(),
      { name: 'account', type: 'ContractAddress' },
      { name: 'token_ids', type: 'Span<u256>' },
      { name: 'values', type: 'Span<u256>' },
      { name: 'data', type: 'Span<felt252>' },
    ],
    code: [
      'self.erc1155.batch_mint_with_acceptance_check(account, token_ids, values, data);',
    ]
  },
  batchMint: {
    args: [
      getSelfArg(),
      { name: 'account', type: 'ContractAddress' },
      { name: 'tokenIds', type: 'Span<u256>' },
      { name: 'values', type: 'Span<u256>' },
      { name: 'data', type: 'Span<felt252>' },
    ],
    code: [
      'self.batch_mint(account, tokenIds, values, data);',
    ]
  },
  set_base_uri: {
    args: [
      getSelfArg(),
      { name: 'base_uri', type: 'ByteArray' },
    ],
    code: [
      'self.erc1155._set_base_uri(base_uri);'
    ]
  },
  setBaseUri: {
    args: [
      getSelfArg(),
      { name: 'baseUri', type: 'ByteArray' },
    ],
    code: [
      'self.set_base_uri(baseUri);'
    ]
  },
});
