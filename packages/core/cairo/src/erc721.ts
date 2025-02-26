import type { BaseImplementedTrait, Contract } from './contract';
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
import { addSRC5Component, addVotesComponent } from './common-components';
import { externalTrait } from './external-trait';
import { toByteArray, toFelt252 } from './utils/convert-strings';
import { OptionsError } from './error';
import type { RoyaltyInfoOptions } from './set-royalty-info';
import { setRoyaltyInfo, defaults as royaltyInfoDefaults } from './set-royalty-info';

export const defaults: Required<ERC721Options> = {
  name: 'MyToken',
  symbol: 'MTK',
  baseUri: '',
  burnable: false,
  pausable: false,
  mintable: false,
  enumerable: false,
  votes: false,
  royaltyInfo: royaltyInfoDefaults,
  appName: '', // Defaults to empty string, but user must provide a non-empty value if votes are enabled
  appVersion: 'v1',
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info,
} as const;

export function printERC721(opts: ERC721Options = defaults): string {
  return printContract(buildERC721(opts));
}

export interface ERC721Options extends CommonContractOptions {
  name: string;
  symbol: string;
  baseUri?: string;
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
  enumerable?: boolean;
  votes?: boolean;
  royaltyInfo?: RoyaltyInfoOptions;
  appName?: string;
  appVersion?: string;
}

function withDefaults(opts: ERC721Options): Required<ERC721Options> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    baseUri: opts.baseUri ?? defaults.baseUri,
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    mintable: opts.mintable ?? defaults.mintable,
    enumerable: opts.enumerable ?? defaults.enumerable,
    royaltyInfo: opts.royaltyInfo ?? defaults.royaltyInfo,
    votes: opts.votes ?? defaults.votes,
    appName: opts.appName ?? defaults.appName,
    appVersion: opts.appVersion ?? defaults.appVersion,
  };
}

export function isAccessControlRequired(opts: Partial<ERC721Options>): boolean {
  return (
    opts.mintable === true || opts.pausable === true || opts.upgradeable === true || opts.royaltyInfo?.enabled === true
  );
}

export function buildERC721(opts: ERC721Options): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  addBase(c, toByteArray(allOpts.name), toByteArray(allOpts.symbol), toByteArray(allOpts.baseUri));
  addERC721Mixin(c);

  if (allOpts.pausable) {
    addPausable(c, allOpts.access);
  }

  if (allOpts.burnable) {
    addBurnable(c);
  }

  if (allOpts.mintable) {
    addMintable(c, allOpts.access);
  }

  if (allOpts.enumerable) {
    addEnumerable(c);
  }

  setAccessControl(c, allOpts.access);
  setUpgradeable(c, allOpts.upgradeable, allOpts.access);
  setInfo(c, allOpts.info);
  setRoyaltyInfo(c, allOpts.royaltyInfo, allOpts.access);

  addHooks(c, allOpts);

  return c;
}

function addHooks(c: ContractBuilder, opts: Required<ERC721Options>) {
  const usesCustomHooks = opts.pausable || opts.enumerable || opts.votes;
  if (usesCustomHooks) {
    const ERC721HooksTrait: BaseImplementedTrait = {
      name: `ERC721HooksImpl`,
      of: 'ERC721Component::ERC721HooksTrait<ContractState>',
      tags: [],
      priority: 0,
    };
    c.addImplementedTrait(ERC721HooksTrait);
    c.addUseClause('starknet', 'ContractAddress');

    const requiresMutState = opts.enumerable || opts.votes;
    const initStateLine = requiresMutState
      ? 'let mut contract_state = self.get_contract_mut()'
      : 'let contract_state = self.get_contract()';
    const beforeUpdateCode = [initStateLine];
    if (opts.pausable) {
      beforeUpdateCode.push('contract_state.pausable.assert_not_paused()');
    }
    if (opts.enumerable) {
      beforeUpdateCode.push('contract_state.erc721_enumerable.before_update(to, token_id)');
    }
    if (opts.votes) {
      if (!opts.appName) {
        throw new OptionsError({
          appName: 'Application Name is required when Votes are enabled',
        });
      }

      if (!opts.appVersion) {
        throw new OptionsError({
          appVersion: 'Application Version is required when Votes are enabled',
        });
      }

      addVotesComponent(
        c,
        toFelt252(opts.appName, 'appName'),
        toFelt252(opts.appVersion, 'appVersion'),
        'SNIP12 Metadata',
      );
      beforeUpdateCode.push('let previous_owner = self._owner_of(token_id);');
      beforeUpdateCode.push('contract_state.votes.transfer_voting_units(previous_owner, to, 1);');
    }
    c.addFunction(ERC721HooksTrait, {
      name: 'before_update',
      args: [
        {
          name: 'ref self',
          type: `ERC721Component::ComponentState<ContractState>`,
        },
        { name: 'to', type: 'ContractAddress' },
        { name: 'token_id', type: 'u256' },
        { name: 'auth', type: 'ContractAddress' },
      ],
      code: beforeUpdateCode,
    });
  } else {
    c.addUseClause('openzeppelin::token::erc721', 'ERC721HooksEmptyImpl');
  }
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
  c.addComponent(components.ERC721Component, [name, symbol, baseUri], true);
}

function addEnumerable(c: ContractBuilder) {
  c.addComponent(components.ERC721EnumerableComponent, [], true);
}

function addBurnable(c: ContractBuilder) {
  c.addUseClause('core::num::traits', 'Zero');
  c.addUseClause('starknet', 'get_caller_address');

  c.addFunction(externalTrait, functions.burn);
}

function addMintable(c: ContractBuilder, access: Access) {
  c.addUseClause('starknet', 'ContractAddress');
  requireAccessControl(c, externalTrait, functions.safe_mint, access, 'MINTER', 'minter');

  // Camel case version of safe_mint. Access control and pausable are already set on safe_mint.
  c.addFunction(externalTrait, functions.safeMint);
}

const components = defineComponents({
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
        name: 'ERC721InternalImpl',
        embed: false,
        value: 'ERC721Component::InternalImpl<ContractState>',
      },
    ],
  },
  ERC721EnumerableComponent: {
    path: 'openzeppelin::token::erc721::extensions',
    substorage: {
      name: 'erc721_enumerable',
      type: 'ERC721EnumerableComponent::Storage',
    },
    event: {
      name: 'ERC721EnumerableEvent',
      type: 'ERC721EnumerableComponent::Event',
    },
    impls: [
      {
        name: 'ERC721EnumerableImpl',
        value: 'ERC721EnumerableComponent::ERC721EnumerableImpl<ContractState>',
      },
      {
        name: 'ERC721EnumerableInternalImpl',
        embed: false,
        value: 'ERC721EnumerableComponent::InternalImpl<ContractState>',
      },
    ],
  },
});

const functions = defineFunctions({
  burn: {
    args: [getSelfArg(), { name: 'token_id', type: 'u256' }],
    code: ['self.erc721.update(Zero::zero(), token_id, get_caller_address());'],
  },
  safe_mint: {
    args: [
      getSelfArg(),
      { name: 'recipient', type: 'ContractAddress' },
      { name: 'token_id', type: 'u256' },
      { name: 'data', type: 'Span<felt252>' },
    ],
    code: ['self.erc721.safe_mint(recipient, token_id, data);'],
  },
  safeMint: {
    args: [
      getSelfArg(),
      { name: 'recipient', type: 'ContractAddress' },
      { name: 'tokenId', type: 'u256' },
      { name: 'data', type: 'Span<felt252>' },
    ],
    code: ['self.safe_mint(recipient, tokenId, data);'],
  },
});
