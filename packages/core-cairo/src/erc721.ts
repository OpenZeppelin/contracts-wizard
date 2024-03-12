import { BaseImplementedTrait, Contract, ContractBuilder } from './contract';
import { Access, requireAccessControl, setAccessControl } from './set-access-control';
import { addPausable, setPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults, getSelfArg } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { defineComponents } from './utils/define-components';
import { defaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { addSRC5Component } from './common-components';
import { externalTrait } from './external-trait';
import { toShortString } from './utils/convert-strings';

export const defaults: Required<ERC721Options> = {
  name: 'MyToken',
  symbol: 'MTK',
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
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
}

function withDefaults(opts: ERC721Options): Required<ERC721Options> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
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

  addBase(c, toShortString(allOpts.name, 'name'), toShortString(allOpts.symbol, 'symbol'));
  addERC721ImplAndCamelOnlyImpl(c, allOpts.pausable);

  if (allOpts.pausable) {
    addPausable(c, allOpts.access);
  }

  if (allOpts.burnable) {
    addBurnable(c);
    if (allOpts.pausable) {
      setPausable(c, externalTrait, functions.burn);
    }
  }

  if (allOpts.mintable) {
    addMintable(c, allOpts.access);
    if (allOpts.pausable) {
      setPausable(c, externalTrait, functions.safe_mint);
    }
  }

  setAccessControl(c, allOpts.access);
  setUpgradeable(c, allOpts.upgradeable, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

function addERC721Interface(c: ContractBuilder) {
  c.addStandaloneImport('openzeppelin::token::erc721::interface');
}

function addERC721ImplAndCamelOnlyImpl(c: ContractBuilder, pausable: boolean) {
  if (pausable) {
    addERC721Interface(c);

    const ERC721Impl: BaseImplementedTrait = {
      name: 'ERC721Impl',
      of: 'interface::IERC721<ContractState>',
      tags: [
        'abi(embed_v0)'
      ],
    }
    c.addFunction(ERC721Impl, functions.balance_of);
    c.addFunction(ERC721Impl, functions.owner_of);
    setPausable(c, ERC721Impl, functions.safe_transfer_from);
    setPausable(c, ERC721Impl, functions.transfer_from);
    setPausable(c, ERC721Impl, functions.approve);
    setPausable(c, ERC721Impl, functions.set_approval_for_all);
    c.addFunction(ERC721Impl, functions.get_approved);
    c.addFunction(ERC721Impl, functions.is_approved_for_all);

    const ERC721CamelOnlyImpl: BaseImplementedTrait = {
      name: 'ERC721CamelOnlyImpl',
      of: 'interface::IERC721CamelOnly<ContractState>',
      tags: [
        'abi(embed_v0)'
      ],
    }
    c.addFunction(ERC721CamelOnlyImpl, functions.balanceOf);
    c.addFunction(ERC721CamelOnlyImpl, functions.ownerOf);
    setPausable(c, ERC721CamelOnlyImpl, functions.safeTransferFrom);
    setPausable(c, ERC721CamelOnlyImpl, functions.transferFrom);
    setPausable(c, ERC721CamelOnlyImpl, functions.setApprovalForAll);
    c.addFunction(ERC721CamelOnlyImpl, functions.getApproved);
    c.addFunction(ERC721CamelOnlyImpl, functions.isApprovedForAll);
  } else {
    c.addImplToComponent(components.ERC721Component, {
      name: 'ERC721Impl',
      value: 'ERC721Component::ERC721Impl<ContractState>',
    });
    c.addImplToComponent(components.ERC721Component, {
      name: 'ERC721CamelOnly',
      value: 'ERC721Component::ERC721CamelOnlyImpl<ContractState>',
    });
  }
}

function addBase(c: ContractBuilder, name: string, symbol: string) {
  c.addComponent(
    components.ERC721Component,
    [
      name, symbol
    ],
    true,
  );
  addSRC5Component(c);
}

function addBurnable(c: ContractBuilder) {
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
    impls: [
      {
        name: 'ERC721MetadataImpl',
        value: 'ERC721Component::ERC721MetadataImpl<ContractState>',
      },
      {
        name: 'ERC721MetadataCamelOnly',
        value: 'ERC721Component::ERC721MetadataCamelOnlyImpl<ContractState>',
      }
    ],
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
      'let caller = get_caller_address();',
      'assert(self.erc721._is_approved_or_owner(caller, token_id), ERC721Component::Errors::UNAUTHORIZED)',
      'self.erc721._burn(token_id);'
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
      'self.erc721._safe_mint(recipient, token_id, data);',
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

  // Re-implements ERC721Impl
  balance_of: {
    args: [
      getSelfArg('view'),
      { name: 'account', type: 'ContractAddress' },
    ],
    returns: 'u256',
    code: [
      'self.erc721.balance_of(account)'
    ]
  },
  owner_of: {
    args: [
      getSelfArg('view'),
      { name: 'token_id', type: 'u256' },
    ],
    returns: 'ContractAddress',
    code: [
      'self.erc721.owner_of(token_id)'
    ]
  },
  safe_transfer_from: {
    args: [
      getSelfArg(),
      { name: 'from', type: 'ContractAddress' },
      { name: 'to', type: 'ContractAddress' },
      { name: 'token_id', type: 'u256' },
      { name: 'data', type: 'Span<felt252>' },
    ],
    code: [
      'self.erc721.safe_transfer_from(from, to, token_id, data)'
    ]
  },
  transfer_from: {
    args: [
      getSelfArg(),
      { name: 'from', type: 'ContractAddress' },
      { name: 'to', type: 'ContractAddress' },
      { name: 'token_id', type: 'u256' },
    ],
    code: [
      'self.erc721.transfer_from(from, to, token_id)'
    ]
  },
  approve: {
    args: [
      getSelfArg(),
      { name: 'to', type: 'ContractAddress' },
      { name: 'token_id', type: 'u256' },
    ],
    code: [
      'self.erc721.approve(to, token_id)'
    ]
  },
  set_approval_for_all: {
    args: [
      getSelfArg(),
      { name: 'operator', type: 'ContractAddress' },
      { name: 'approved', type: 'bool' },
    ],
    code: [
      'self.erc721.set_approval_for_all(operator, approved)'
    ]
  },
  get_approved: {
    args: [
      getSelfArg('view'),
      { name: 'token_id', type: 'u256' },
    ],
    returns: 'ContractAddress',
    code: [
      'self.erc721.get_approved(token_id)'
    ]
  },
  is_approved_for_all: {
    args: [
      getSelfArg('view'),
      { name: 'owner', type: 'ContractAddress' },
      { name: 'operator', type: 'ContractAddress' },
    ],
    returns: 'bool',
    code: [
      'self.erc721.is_approved_for_all(owner, operator)'
    ]
  },

  // Re-implements ERC721CamelOnlyImpl

  balanceOf: {
    args: [
      getSelfArg('view'),
      { name: 'account', type: 'ContractAddress' },
    ],
    returns: 'u256',
    code: [
      'self.balance_of(account)'
    ]
  },
  ownerOf: {
    args: [
      getSelfArg('view'),
      { name: 'tokenId', type: 'u256' },
    ],
    returns: 'ContractAddress',
    code: [
      'self.owner_of(tokenId)'
    ]
  },
  safeTransferFrom: {
    args: [
      getSelfArg(),
      { name: 'from', type: 'ContractAddress' },
      { name: 'to', type: 'ContractAddress' },
      { name: 'tokenId', type: 'u256' },
      { name: 'data', type: 'Span<felt252>' },
    ],
    code: [
      'self.safe_transfer_from(from, to, tokenId, data)'
    ]
  },
  transferFrom: {
    args: [
      getSelfArg(),
      { name: 'from', type: 'ContractAddress' },
      { name: 'to', type: 'ContractAddress' },
      { name: 'tokenId', type: 'u256' },
    ],
    code: [
      'self.transfer_from(from, to, tokenId)'
    ]
  },
  setApprovalForAll: {
    args: [
      getSelfArg(),
      { name: 'operator', type: 'ContractAddress' },
      { name: 'approved', type: 'bool' },
    ],
    code: [
      'self.set_approval_for_all(operator, approved)'
    ]
  },
  getApproved: {
    args: [
      getSelfArg('view'),
      { name: 'tokenId', type: 'u256' },
    ],
    returns: 'ContractAddress',
    code: [
      'self.get_approved(tokenId)'
    ]
  },
  isApprovedForAll: {
    args: [
      getSelfArg('view'),
      { name: 'owner', type: 'ContractAddress' },
      { name: 'operator', type: 'ContractAddress' },
    ],
    returns: 'bool',
    code: [
      'self.is_approved_for_all(owner, operator)'
    ]
  },
});
