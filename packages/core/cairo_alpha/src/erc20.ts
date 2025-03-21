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
import { OptionsError } from './error';
import { defineComponents } from './utils/define-components';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { externalTrait } from './external-trait';
import { toByteArray, toFelt252, toUint } from './utils/convert-strings';
import { addVotesComponent } from './common-components';

export const defaults: Required<ERC20Options> = {
  name: 'MyToken',
  symbol: 'MTK',
  burnable: false,
  pausable: false,
  premint: '0',
  mintable: false,
  votes: false,
  appName: '', // Defaults to empty string, but user must provide a non-empty value if votes are enabled
  appVersion: 'v1',
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info,
} as const;

export function printERC20(opts: ERC20Options = defaults): string {
  return printContract(buildERC20(opts));
}

export interface ERC20Options extends CommonContractOptions {
  name: string;
  symbol: string;
  burnable?: boolean;
  pausable?: boolean;
  premint?: string;
  mintable?: boolean;
  votes?: boolean;
  appName?: string;
  appVersion?: string;
}

function withDefaults(opts: ERC20Options): Required<ERC20Options> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    premint: opts.premint || defaults.premint,
    mintable: opts.mintable ?? defaults.mintable,
    votes: opts.votes ?? defaults.votes,
    appName: opts.appName ?? defaults.appName,
    appVersion: opts.appVersion ?? defaults.appVersion,
  };
}

export function isAccessControlRequired(opts: Partial<ERC20Options>): boolean {
  return opts.mintable === true || opts.pausable === true || opts.upgradeable === true;
}

export function buildERC20(opts: ERC20Options): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  addBase(c, toByteArray(allOpts.name), toByteArray(allOpts.symbol));
  addERC20Mixin(c);

  if (allOpts.premint) {
    addPremint(c, allOpts.premint);
  }

  if (allOpts.pausable) {
    addPausable(c, allOpts.access);
  }

  if (allOpts.burnable) {
    addBurnable(c);
  }

  if (allOpts.mintable) {
    addMintable(c, allOpts.access);
  }

  addHooks(c, allOpts);

  setAccessControl(c, allOpts.access);
  setUpgradeable(c, allOpts.upgradeable, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

function addHooks(c: ContractBuilder, allOpts: Required<ERC20Options>) {
  const usesCustomHooks = allOpts.pausable || allOpts.votes;
  if (usesCustomHooks) {
    const hooksTrait = {
      name: 'ERC20HooksImpl',
      of: 'ERC20Component::ERC20HooksTrait<ContractState>',
      tags: [],
      priority: 1,
    };
    c.addImplementedTrait(hooksTrait);

    if (allOpts.pausable) {
      const beforeUpdateFn = c.addFunction(hooksTrait, {
        name: 'before_update',
        args: [
          {
            name: 'ref self',
            type: 'ERC20Component::ComponentState<ContractState>',
          },
          { name: 'from', type: 'ContractAddress' },
          { name: 'recipient', type: 'ContractAddress' },
          { name: 'amount', type: 'u256' },
        ],
        code: [],
      });

      beforeUpdateFn.code.push(
        'let contract_state = self.get_contract();',
        'contract_state.pausable.assert_not_paused();',
      );
    }

    if (allOpts.votes) {
      if (!allOpts.appName) {
        throw new OptionsError({
          appName: 'Application Name is required when Votes are enabled',
        });
      }

      if (!allOpts.appVersion) {
        throw new OptionsError({
          appVersion: 'Application Version is required when Votes are enabled',
        });
      }

      addVotesComponent(
        c,
        toFelt252(allOpts.appName, 'appName'),
        toFelt252(allOpts.appVersion, 'appVersion'),
        'SNIP12 Metadata',
      );

      const afterUpdateFn = c.addFunction(hooksTrait, {
        name: 'after_update',
        args: [
          {
            name: 'ref self',
            type: 'ERC20Component::ComponentState<ContractState>',
          },
          { name: 'from', type: 'ContractAddress' },
          { name: 'recipient', type: 'ContractAddress' },
          { name: 'amount', type: 'u256' },
        ],
        code: [],
      });

      afterUpdateFn.code.push(
        'let mut contract_state = self.get_contract_mut();',
        'contract_state.votes.transfer_voting_units(from, recipient, amount);',
      );
    }
  } else {
    c.addUseClause('openzeppelin::token::erc20', 'ERC20HooksEmptyImpl');
  }
}

function addERC20Mixin(c: ContractBuilder) {
  c.addImplToComponent(components.ERC20Component, {
    name: 'ERC20MixinImpl',
    value: 'ERC20Component::ERC20MixinImpl<ContractState>',
  });
}

function addBase(c: ContractBuilder, name: string, symbol: string) {
  c.addComponent(components.ERC20Component, [name, symbol], true);
}

function addBurnable(c: ContractBuilder) {
  c.addUseClause('starknet', 'get_caller_address');
  c.addFunction(externalTrait, functions.burn);
}

export const premintPattern = /^(\d*\.?\d*)$/;

function addPremint(c: ContractBuilder, amount: string) {
  if (amount !== undefined && amount !== '0') {
    if (!premintPattern.test(amount)) {
      throw new OptionsError({
        premint: 'Not a valid number',
      });
    }

    const premintAbsolute = toUint(getInitialSupply(amount, 18), 'premint', 'u256');

    c.addUseClause('starknet', 'ContractAddress');
    c.addConstructorArgument({ name: 'recipient', type: 'ContractAddress' });
    c.addConstructorCode(`self.erc20.mint(recipient, ${premintAbsolute})`);
  }
}

/**
 * Calculates the initial supply that would be used in an ERC20 contract based on a given premint amount and number of decimals.
 *
 * @param premint Premint amount in token units, may be fractional
 * @param decimals The number of decimals in the token
 * @returns `premint` with zeros padded or removed based on `decimals`.
 * @throws OptionsError if `premint` has more than one decimal character or is more precise than allowed by the `decimals` argument.
 */
export function getInitialSupply(premint: string, decimals: number): string {
  let result;
  const premintSegments = premint.split('.');
  if (premintSegments.length > 2) {
    throw new OptionsError({
      premint: 'Not a valid number',
    });
  } else {
    const firstSegment = premintSegments[0] ?? '';
    let lastSegment = premintSegments[1] ?? '';
    if (decimals > lastSegment.length) {
      try {
        lastSegment += '0'.repeat(decimals - lastSegment.length);
      } catch {
        // .repeat gives an error if decimals number is too large
        throw new OptionsError({
          premint: 'Decimals number too large',
        });
      }
    } else if (decimals < lastSegment.length) {
      throw new OptionsError({
        premint: 'Too many decimals',
      });
    }
    // concat segments without leading zeros
    result = firstSegment.concat(lastSegment).replace(/^0+/, '');
  }
  if (result.length === 0) {
    result = '0';
  }
  return result;
}

function addMintable(c: ContractBuilder, access: Access) {
  c.addUseClause('starknet', 'ContractAddress');
  requireAccessControl(c, externalTrait, functions.mint, access, 'MINTER', 'minter');
}

const components = defineComponents({
  ERC20Component: {
    path: 'openzeppelin::token::erc20',
    substorage: {
      name: 'erc20',
      type: 'ERC20Component::Storage',
    },
    event: {
      name: 'ERC20Event',
      type: 'ERC20Component::Event',
    },
    impls: [
      {
        name: 'ERC20InternalImpl',
        embed: false,
        value: 'ERC20Component::InternalImpl<ContractState>',
      },
    ],
  },
});

const functions = defineFunctions({
  burn: {
    args: [getSelfArg(), { name: 'value', type: 'u256' }],
    code: ['self.erc20.burn(get_caller_address(), value);'],
  },
  mint: {
    args: [getSelfArg(), { name: 'recipient', type: 'ContractAddress' }, { name: 'amount', type: 'u256' }],
    code: ['self.erc20.mint(recipient, amount);'],
  },
});
