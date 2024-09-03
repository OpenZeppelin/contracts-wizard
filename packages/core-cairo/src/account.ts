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

export const defaults: Required<AccountOptions> = {
  name: 'MyAccount',
  symbol: 'MTK',
  baseUri: '',
  burnable: false,
  pausable: false,
  mintable: false,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info
} as const;

export function printAccount(opts: AccountOptions = defaults): string {
  return printContract(buildAccount(opts));
}

export interface AccountOptions extends CommonOptions {
  name: string;
  symbol: string;
  baseUri?: string;
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
}

function withDefaults(opts: AccountOptions): Required<AccountOptions> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    baseUri: opts.baseUri ?? defaults.baseUri,
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    mintable: opts.mintable ?? defaults.mintable,
  };
}

export function isAccessControlRequired(opts: Partial<AccountOptions>): boolean {
  return opts.mintable === true || opts.pausable === true || opts.upgradeable === true;
}

export function buildAccount(opts: AccountOptions): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  addBase(c, toByteArray(allOpts.name));
  addAccountMixin(c);

  if (allOpts.pausable) {
    addPausable(c, allOpts.access);
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

function addAccountMixin(c: ContractBuilder) {
  c.addImplToComponent(components.AccountComponent, {
    name: 'AccountMixinImpl',
    value: 'AccountComponent::AccountMixinImpl<ContractState>',
  });
  c.addInterfaceFlag('ISRC5');
  addSRC5Component(c);
}

function addBase(c: ContractBuilder, public_key: string) {
  c.addComponent(
    components.AccountComponent,
    [
        public_key
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
  AccountComponent: {
    path: 'openzeppelin::token::account',
    substorage: {
      name: 'account',
      type: 'AccountComponent::Storage',
    },
    event: {
      name: 'AccountEvent',
      type: 'AccountComponent::Event',
    },
    impls: [],
    internalImpl: {
      name: 'AccountInternalImpl',
      value: 'AccountComponent::InternalImpl<ContractState>',
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
      'self.account.update(Zero::zero(), token_id, get_caller_address());',
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
      'self.account.safe_mint(recipient, token_id, data);',
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
