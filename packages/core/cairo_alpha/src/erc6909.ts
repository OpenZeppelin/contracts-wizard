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

export const defaults: Required<ERC6909Options> = {
  name: 'MyToken',
  burnable: false,
  pausable: false,
  mintable: false,
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
}

function withDefaults(opts: ERC6909Options): Required<ERC6909Options> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    mintable: opts.mintable ?? defaults.mintable,
  };
}

export function isAccessControlRequired(opts: Partial<ERC6909Options>): boolean {
  return opts.mintable === true || opts.pausable === true || opts.upgradeable === true;
}

export function buildERC6909(opts: ERC6909Options): Contract {
  const allOpts = withDefaults(opts);
  const c = new ContractBuilder(allOpts.name, allOpts.macros);

  addBase(c);
  c.addInterfaceFlag('ISRC5');
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

  setAccessControl(c, allOpts.access);
  setUpgradeable(c, allOpts.upgradeable, allOpts.access);
  setInfo(c, allOpts.info);

  addHooks(c, allOpts);

  return c;
}

function addHooks(c: ContractBuilder, allOpts: Required<ERC6909Options>) {
  const usesCustomHooks = allOpts.pausable;
  if (usesCustomHooks) {
    const hooksTrait = {
      name: 'ERC6909HooksImpl',
      of: 'ERC6909Component::ERC6909HooksTrait<ContractState>',
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
          type: `ERC6909Component::ComponentState<ContractState>`,
        },
        { name: 'from', type: 'ContractAddress' },
        { name: 'recipient', type: 'ContractAddress' },
        { name: 'id', type: 'u256' },
        { name: 'amount', type: 'u256' },
      ],
      code: ['let contract_state = self.get_contract()', 'contract_state.pausable.assert_not_paused()'],
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
