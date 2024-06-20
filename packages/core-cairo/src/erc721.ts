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

export const defaults: Required<ERC721Options> = {
  name: 'MyToken',
  symbol: 'MTK',
  baseUri: '',
  burnable: false,
  pausable: false,
  mintable: false,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info
} as const;

export function printERC721(opts: ERC721Options = defaults): string {
  return printContract(buildERC721(opts));
}

export interface ERC721Options extends CommonOptions {
  name: string;
  symbol: string;
  baseUri?: string;
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
}

function withDefaults(opts: ERC721Options): Required<ERC721Options> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    baseUri: opts.baseUri ?? defaults.baseUri,
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    mintable: opts.mintable ?? defaults.mintable,
  };
}

export function isAccessControlRequired(opts: Partial<ERC721Options>): boolean {
  return opts.mintable === true || opts.pausable === true || opts.upgradeable === true;
}

export function buildERC721(opts: ERC721Options): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  addBase(c, toByteArray(allOpts.name), toByteArray(allOpts.symbol), toByteArray(allOpts.baseUri));
  addERC721Mixin(c);

  if (allOpts.pausable) {
    addPausable(c, allOpts.access);
    addPausableHook(c);
  } else {
    c.addStandaloneImport('openzeppelin::token::erc721::ERC721HooksEmptyImpl');
  }

  if (allOpts.burnable) {
    addBurnable(c);
  }

  if (allOpts.mintable) {
    addMintable(c, allOpts.access);
  }

  setAccessControl(c, allOpts.access);
  setUpgradeable(c, allOpts.upgradeable, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

function addPausableHook(c: ContractBuilder) {
  const ERC721HooksTrait: BaseImplementedTrait = {
    name: `ERC721HooksImpl`,
    of: 'ERC721Component::ERC721HooksTrait<ContractState>',
    tags: [],
    priority: 0,
  };
  c.addImplementedTrait(ERC721HooksTrait);

  c.addStandaloneImport('starknet::ContractAddress');

  c.addFunction(ERC721HooksTrait, {
    name: 'before_update',
    args: [
      { name: 'ref self', type: `ERC721Component::ComponentState<ContractState>` },
      { name: 'to', type: 'ContractAddress' },
      { name: 'token_id', type: 'u256' },
      { name: 'auth', type: 'ContractAddress' },
    ],
    code: [
      'let contract_state = ERC721Component::HasComponent::get_contract(@self)',
      'contract_state.pausable.assert_not_paused()',
    ],
  });

  c.addFunction(ERC721HooksTrait, {
    name: 'after_update',
    args: [
      { name: 'ref self', type: `ERC721Component::ComponentState<ContractState>` },
      { name: 'to', type: 'ContractAddress' },
      { name: 'token_id', type: 'u256' },
      { name: 'auth', type: 'ContractAddress' },
    ],
    code: [],
  });
}

function addERC721Mixin(c: ContractBuilder) {
  c.addImplToComponent(components.ERC721Component, {
    name: 'ERC721MixinImpl',
    value: 'ERC721Component::ERC721MixinImpl<ContractState>',
  });
  c.addInterfaceFlag('ISRC5');
  addSRC5Component(c);
}

function addBase(c: ContractBuilder, name: string, symbol: string, baseUri: string) {
  c.addComponent(
    components.ERC721Component,
    [
      name, symbol, baseUri,
    ],
    true,
  );
}

function addBurnable(c: ContractBuilder) {
  c.addStandaloneImport('core::num::traits::Zero');
  c.addStandaloneImport('starknet::get_caller_address');

  c.addFunction(externalTrait, functions.burn);
}

function addMintable(c: ContractBuilder, access: Access) {
  c.addStandaloneImport('starknet::ContractAddress');
  requireAccessControl(c, externalTrait, functions.safe_mint, access, 'MINTER', 'minter');

  // Camel case version of safe_mint. Access control and pausable are already set on safe_mint.
  c.addFunction(externalTrait, functions.safeMint);
}

const components = defineComponents( {
  ERC721Component: {
    path: 'openzeppelin::token::erc721',
    substorage: {
      name: 'erc721',
      type: 'ERC721Component::Storage',
    },
    event: {
      name: 'ERC721Event',
      type: 'ERC721Component::Event',
    },
    impls: [],
    internalImpl: {
      name: 'ERC721InternalImpl',
      value: 'ERC721Component::InternalImpl<ContractState>',
    },
  },
});

const functions = defineFunctions({
  burn: {
    args: [
      getSelfArg(),
      { name: 'token_id', type: 'u256' }
    ],
    code: [
      'self.erc721.update(Zero::zero(), token_id, get_caller_address());',
    ]
  },
  safe_mint: {
    args: [
      getSelfArg(),
      { name: 'recipient', type: 'ContractAddress' },
      { name: 'token_id', type: 'u256' },
      { name: 'data', type: 'Span<felt252>' },
    ],
    code: [
      'self.erc721.safe_mint(recipient, token_id, data);',
    ]
  },
  safeMint: {
    args: [
      getSelfArg(),
      { name: 'recipient', type: 'ContractAddress' },
      { name: 'tokenId', type: 'u256' },
      { name: 'data', type: 'Span<felt252>' },
    ],
    code: [
      'self.safe_mint(recipient, tokenId, data);',
    ]
  },
});
