import { Contract, ContractBuilder } from './contract';
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

  addBase(c, allOpts.name, allOpts.symbol);

  if (allOpts.burnable) {
    addBurnable(c);
  }

  if (allOpts.pausable) {
    addPausable(c, allOpts.access);
    if (allOpts.burnable) {
      setPausable(c, functions.burn);
    }
  }

  if (allOpts.mintable) {
    addMintable(c, allOpts.access);
  }

  setAccessControl(c, allOpts.access);
  setUpgradeable(c, allOpts.upgradeable, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
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
        name: 'ERC721Impl',
        value: 'ERC721Component::ERC721Impl<ContractState>',
      },
      {
        name: 'ERC721MetadataImpl',
        value: 'ERC721Component::ERC721MetadataImpl<ContractState>',
      },
      {
        name: 'ERC721CamelOnly',
        value: 'ERC721Component::ERC721CamelOnlyImpl<ContractState>',
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
      { name: 'token_uri', type: 'felt252' },
    ],
    code: [
      'self.erc721._safe_mint(recipient, token_id, data);',
      'self.erc721._set_token_uri(token_id, token_uri);',
    ]
  }
});
