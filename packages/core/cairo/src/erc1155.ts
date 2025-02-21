import type { Contract } from './contract';
import { ContractBuilder } from './contract';
import type { Access } from './set-access-control';
import { requireAccessControl, setAccessControl } from './set-access-control';
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
import { toByteArray } from './utils/convert-strings';
import type { RoyaltyInfoOptions } from './set-royalty-info';
import { setRoyaltyInfo, defaults as royaltyInfoDefaults } from './set-royalty-info';

export const defaults: Required<ERC1155Options> = {
  name: 'MyToken',
  baseUri: '',
  burnable: false,
  pausable: false,
  mintable: false,
  updatableUri: true,
  royaltyInfo: royaltyInfoDefaults,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info,
} as const;

export function printERC1155(opts: ERC1155Options = defaults): string {
  return printContract(buildERC1155(opts));
}

export interface ERC1155Options extends CommonContractOptions {
  name: string;
  baseUri: string;
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
  updatableUri?: boolean;
  royaltyInfo?: RoyaltyInfoOptions;
}

function withDefaults(opts: ERC1155Options): Required<ERC1155Options> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    mintable: opts.mintable ?? defaults.mintable,
    updatableUri: opts.updatableUri ?? defaults.updatableUri,
    royaltyInfo: opts.royaltyInfo ?? defaults.royaltyInfo,
  };
}

export function isAccessControlRequired(opts: Partial<ERC1155Options>): boolean {
  return (
    opts.mintable === true ||
    opts.pausable === true ||
    opts.updatableUri !== false ||
    opts.upgradeable === true ||
    opts.royaltyInfo?.enabled === true
  );
}

export function buildERC1155(opts: ERC1155Options): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  addBase(c, toByteArray(allOpts.baseUri));
  addERC1155Mixin(c);

  if (allOpts.pausable) {
    addPausable(c, allOpts.access);
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
  setRoyaltyInfo(c, allOpts.royaltyInfo, allOpts.access);

  addHooks(c, allOpts);

  return c;
}

function addHooks(c: ContractBuilder, allOpts: Required<ERC1155Options>) {
  const usesCustomHooks = allOpts.pausable;
  if (usesCustomHooks) {
    const hooksTrait = {
      name: 'ERC1155HooksImpl',
      of: 'ERC1155Component::ERC1155HooksTrait<ContractState>',
      tags: [],
      priority: 1,
    };
    c.addImplementedTrait(hooksTrait);
    c.addUseClause('starknet', 'ContractAddress');

    c.addFunction(hooksTrait, {
      name: 'before_update',
      args: [
        {
          name: 'ref self',
          type: `ERC1155Component::ComponentState<ContractState>`,
        },
        { name: 'from', type: 'ContractAddress' },
        { name: 'to', type: 'ContractAddress' },
        { name: 'token_ids', type: 'Span<u256>' },
        { name: 'values', type: 'Span<u256>' },
      ],
      code: ['let contract_state = self.get_contract()', 'contract_state.pausable.assert_not_paused()'],
    });
  } else {
    c.addUseClause('openzeppelin::token::erc1155', 'ERC1155HooksEmptyImpl');
  }
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
  c.addComponent(components.ERC1155Component, [baseUri], true);
}

function addBurnable(c: ContractBuilder) {
  c.addUseClause('starknet', 'ContractAddress');
  c.addUseClause('starknet', 'get_caller_address');
  c.addFunction(externalTrait, functions.burn);
  c.addFunction(externalTrait, functions.batch_burn);
  c.addFunction(externalTrait, functions.batchBurn);
}

function addMintable(c: ContractBuilder, access: Access) {
  c.addUseClause('starknet', 'ContractAddress');
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

const components = defineComponents({
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
    impls: [
      {
        name: 'ERC1155InternalImpl',
        embed: false,
        value: 'ERC1155Component::InternalImpl<ContractState>',
      },
    ],
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
      'self.erc1155.burn(account, token_id, value);',
    ],
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
      'self.erc1155.batch_burn(account, token_ids, values);',
    ],
  },
  batchBurn: {
    args: [
      getSelfArg(),
      { name: 'account', type: 'ContractAddress' },
      { name: 'tokenIds', type: 'Span<u256>' },
      { name: 'values', type: 'Span<u256>' },
    ],
    code: ['self.batch_burn(account, tokenIds, values);'],
  },
  mint: {
    args: [
      getSelfArg(),
      { name: 'account', type: 'ContractAddress' },
      { name: 'token_id', type: 'u256' },
      { name: 'value', type: 'u256' },
      { name: 'data', type: 'Span<felt252>' },
    ],
    code: ['self.erc1155.mint_with_acceptance_check(account, token_id, value, data);'],
  },
  batch_mint: {
    args: [
      getSelfArg(),
      { name: 'account', type: 'ContractAddress' },
      { name: 'token_ids', type: 'Span<u256>' },
      { name: 'values', type: 'Span<u256>' },
      { name: 'data', type: 'Span<felt252>' },
    ],
    code: ['self.erc1155.batch_mint_with_acceptance_check(account, token_ids, values, data);'],
  },
  batchMint: {
    args: [
      getSelfArg(),
      { name: 'account', type: 'ContractAddress' },
      { name: 'tokenIds', type: 'Span<u256>' },
      { name: 'values', type: 'Span<u256>' },
      { name: 'data', type: 'Span<felt252>' },
    ],
    code: ['self.batch_mint(account, tokenIds, values, data);'],
  },
  set_base_uri: {
    args: [getSelfArg(), { name: 'base_uri', type: 'ByteArray' }],
    code: ['self.erc1155._set_base_uri(base_uri);'],
  },
  setBaseUri: {
    args: [getSelfArg(), { name: 'baseUri', type: 'ByteArray' }],
    code: ['self.set_base_uri(baseUri);'],
  },
});
