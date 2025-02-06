import { Contract, ContractBuilder } from './contract';
import { Access, requireAccessControl, setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { CommonContractOptions, withCommonContractDefaults, getSelfArg } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { OptionsError } from './error';
import { defineComponents } from './utils/define-components';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { externalTrait } from './external-trait';
import { toByteArray, toFelt252, toUint } from './utils/convert-strings';
import { addVotesComponent } from './common-components';


export const defaults: Required<FungibleOptions> = {
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
  info: commonDefaults.info
} as const;

export function printFungible(opts: FungibleOptions = defaults): string {
  return printContract(buildFungible(opts));
}

export interface FungibleOptions extends CommonContractOptions {
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

function withDefaults(opts: FungibleOptions): Required<FungibleOptions> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    premint: opts.premint || defaults.premint,
    mintable: opts.mintable ?? defaults.mintable,
    votes: opts.votes ?? defaults.votes,
    appName: opts.appName ?? defaults.appName,
    appVersion: opts.appVersion ?? defaults.appVersion
  };
}

export function isAccessControlRequired(opts: Partial<FungibleOptions>): boolean {
  return opts.mintable === true || opts.pausable === true || opts.upgradeable === true;
}

export function buildFungible(opts: FungibleOptions): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  allOpts.access = 'ownable';

  addBase(c, toByteArray(allOpts.name), toByteArray(allOpts.symbol));
  // addFungibleMixin(c);

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

  c.addConstructorArgument({ name:'owner', type:'Address' });
  c.addConstructorCode('e.storage().instance().set(&OWNER, &owner);');


  // addHooks(c, allOpts);

  // setAccessControl(c, allOpts.access);
  // setUpgradeable(c, allOpts.upgradeable, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

function addHooks(c: ContractBuilder, allOpts: Required<FungibleOptions>) {
  const usesCustomHooks = allOpts.pausable || allOpts.votes;
  if (usesCustomHooks) {
    const hooksTrait = {
      name: 'FungibleHooksImpl',
      of: 'FungibleComponent::FungibleHooksTrait<ContractState>',
      tags: [],
      priority: 1,
    };
    c.addImplementedTrait(hooksTrait);

    if (allOpts.pausable) {
      const beforeUpdateFn = c.addFunction(hooksTrait, {
        name: 'before_update',
        args: [
          { name: 'ref self', type: 'FungibleComponent::ComponentState<ContractState>' },
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
          { name: 'ref self', type: 'FungibleComponent::ComponentState<ContractState>' },
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
    c.addUseClause('openzeppelin::token::fungible', 'FungibleHooksEmptyImpl');
  }
}

function addBase(c: ContractBuilder, name: string, symbol: string) {
  c.addComponent(
    components.FungibleComponent,
    [
      name, symbol
    ],
    true,
  );
  c.addVariable({ name: 'OWNER', type: 'Symbol', value: `symbol_short!("OWNER")`, imports: ['symbol_short'] });

  c.addConstructorCode(`fungible::metadata::set_metadata(e, 18, String::from_str(e, "${name}"), String::from_str(e, "${symbol}"));`);
}

function addBurnable(c: ContractBuilder) {
  c.addUseClause('openzeppelin_fungible_token', 'burnable::FungibleBurnable');
  c.addUseClause('soroban_sdk', 'Address');

  c.addFunction(fungibleBurnableTrait, functions.burn);
  c.addFunction(fungibleBurnableTrait, functions.burn_from);
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

    c.addUseClause('openzeppelin_fungible_token', 'mintable::FungibleMintable');
    c.addUseClause('soroban_sdk', 'Address');

    c.addConstructorArgument({ name:'owner', type:'Address' });
    c.addConstructorCode(`fungible::mintable::mint(e, &owner, ${premintAbsolute});`);
  }
}

/**
 * Calculates the initial supply that would be used in an Fungible contract based on a given premint amount and number of decimals.
 *
 * @param premint Premint amount in token units, may be fractional
 * @param decimals The number of decimals in the token
 * @returns `premint` with zeros padded or removed based on `decimals`.
 * @throws OptionsError if `premint` has more than one decimal character or is more precise than allowed by the `decimals` argument.
 */
export function getInitialSupply(premint: string, decimals: number): string {
  let result;
  const premintSegments = premint.split(".");
  if (premintSegments.length > 2) {
    throw new OptionsError({
      premint: 'Not a valid number',
    });
  } else {
    let firstSegment = premintSegments[0] ?? '';
    let lastSegment = premintSegments[1] ?? '';
    if (decimals > lastSegment.length) {
      try {
        lastSegment += "0".repeat(decimals - lastSegment.length);
      } catch (e) {
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
  c.addUseClause('openzeppelin_fungible_token', 'mintable::FungibleMintable');
  c.addUseClause('soroban_sdk', 'Address');

  c.addFunction(fungibleMintableTrait, functions.mint);

  requireAccessControl(c, fungibleMintableTrait, functions.mint, access, 'MINTER', 'minter');
}

const fungibleBurnableTrait = {
  name: 'FungibleBurnable',
  of: 'ExampleContract',
  tags: [
    '#[contractimpl]',
  ],
}

const fungibleMintableTrait = {
  name: 'FungibleMintable',
  of: 'ExampleContract',
  tags: [
    '#[contractimpl]',
  ],
}

const components = defineComponents( {
  FungibleComponent: {
    path: 'openzeppelin_fungible_token',
    substorage: {
      name: 'fungible',
      type: 'FungibleComponent::Storage',
    },
    event: {
      name: 'FungibleEvent',
      type: 'FungibleComponent::Event',
    },
    impls: [{
      name: 'FungibleInternalImpl',
      embed: false,
      value: 'FungibleComponent::InternalImpl<ContractState>',
    }],
  },
});

const functions = defineFunctions({
  burn: {
    args: [
      getSelfArg(),
      { name: 'from', type: 'Address' },
      { name: 'amount', type: 'i128' }
    ],
    code: [
      'fungible::burnable::burn(e, &from, amount)'
    ]
  },
  burn_from: {
    args: [
      getSelfArg(),
      { name: 'spender', type: 'Address' },
      { name: 'from', type: 'Address' },
      { name: 'amount', type: 'i128' }
    ],
    code: [
      'fungible::burnable::burn_from(e, &spender, &from, amount)'
    ]
  },
  mint: {
    args: [
      getSelfArg(),
      { name: 'account', type: 'Address' },
      { name: 'amount', type: 'i128' }
    ],
    code: [
      'fungible::mintable::mint(e, &account, amount);'
    ]
  },
});
