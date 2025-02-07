import { Contract, ContractBuilder } from './contract';
import { Access, requireAccessControl, setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { CommonContractOptions, withCommonContractDefaults, getSelfArg } from './common-options';
import { setInfo } from './set-info';
import { OptionsError } from './error';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { toByteArray, toUint } from './utils/convert-strings';


export const defaults: Required<FungibleOptions> = {
  name: 'MyToken',
  symbol: 'MTK',
  burnable: false,
  pausable: false,
  premint: '0',
  mintable: false,
  access: commonDefaults.access,
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
}

function withDefaults(opts: FungibleOptions): Required<FungibleOptions> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    premint: opts.premint || defaults.premint,
    mintable: opts.mintable ?? defaults.mintable,
  };
}

export function buildFungible(opts: FungibleOptions): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  addBase(c, toByteArray(allOpts.name), toByteArray(allOpts.symbol), allOpts.pausable);

  if (allOpts.premint) {
    addPremint(c, allOpts.premint);
  }

  if (allOpts.pausable) {
    addPausable(c, allOpts.name, allOpts.access);
  }

  if (allOpts.burnable) {
    addBurnable(c, allOpts.name, allOpts.pausable);
  }

  if (allOpts.mintable) {
    addMintable(c, allOpts.name, allOpts.access, allOpts.pausable);
  }

  setAccessControl(c, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

function addBase(c: ContractBuilder, name: string, symbol: string, pausable: boolean) {
  // Set metadata
  c.addConstructorCode(`fungible::metadata::set_metadata(e, 18, String::from_str(e, "${name}"), String::from_str(e, "${symbol}"));`);

  // Set token functions
  c.addUseClause('openzeppelin_fungible_token', 'self as fungible');
  c.addUseClause('openzeppelin_fungible_token', 'FungibleToken');
  c.addUseClause('soroban_sdk', 'contract');
  c.addUseClause('soroban_sdk', 'contractimpl');
  c.addUseClause('soroban_sdk', 'Address');
  c.addUseClause('soroban_sdk', 'String');
  c.addUseClause('soroban_sdk', 'Env');
  c.addUseClause('soroban_sdk', 'Symbol');

  const fungibleTokenTrait = {
    name: 'FungibleToken',
    for: name,
    tags: [
      'contractimpl',
    ],
  };

  c.addFunction(fungibleTokenTrait, functions.total_supply);
  c.addFunction(fungibleTokenTrait, functions.balance);
  c.addFunction(fungibleTokenTrait, functions.allowance);
  c.addFunction(fungibleTokenTrait, functions.transfer);
  c.addFunction(fungibleTokenTrait, functions.transfer_from);
  c.addFunction(fungibleTokenTrait, functions.approve);
  c.addFunction(fungibleTokenTrait, functions.decimals);
  c.addFunction(fungibleTokenTrait, functions.name);
  c.addFunction(fungibleTokenTrait, functions.symbol);

  if (pausable) {
    c.addUseClause('openzeppelin_pausable_macros', 'when_not_paused')
    c.addFunctionTag(fungibleTokenTrait, functions.transfer, 'when_not_paused');
    c.addFunctionTag(fungibleTokenTrait, functions.transfer_from, 'when_not_paused');
  }
}

function addBurnable(c: ContractBuilder, name: string, pausable: boolean) {
  c.addUseClause('openzeppelin_fungible_token', 'burnable::FungibleBurnable');
  c.addUseClause('soroban_sdk', 'Address');

  const fungibleBurnableTrait = {
    name: 'FungibleBurnable',
    for: name,
    tags: [
      'contractimpl',
    ],
  }

  c.addFunction(fungibleBurnableTrait, functions.burn);
  c.addFunction(fungibleBurnableTrait, functions.burn_from);

  if (pausable) {
    c.addUseClause('openzeppelin_pausable_macros', 'when_not_paused')
    c.addFunctionTag(fungibleBurnableTrait, functions.burn, 'when_not_paused');
    c.addFunctionTag(fungibleBurnableTrait, functions.burn_from, 'when_not_paused');
  }
}

export const premintPattern = /^(\d*\.?\d*)$/;

function addPremint(c: ContractBuilder, amount: string) {
  if (amount !== undefined && amount !== '0') {
    if (!premintPattern.test(amount)) {
      throw new OptionsError({
        premint: 'Not a valid number',
      });
    }

    // TODO: handle signed int?
    const premintAbsolute = toUint(getInitialSupply(amount, 18), 'premint', 'u128');

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

function addMintable(c: ContractBuilder, name: string, access: Access, pausable: boolean) {
  c.addUseClause('openzeppelin_fungible_token', 'mintable::FungibleMintable');

  const fungibleMintableTrait = {
    name: 'FungibleMintable',
    for: name,
    tags: [
      'contractimpl',
    ],
  }

  c.addFunction(fungibleMintableTrait, functions.mint);

  requireAccessControl(c, fungibleMintableTrait, functions.mint, access);

  if (pausable) {
    c.addFunctionTag(fungibleMintableTrait, functions.mint, 'when_not_paused');
  }
}

const functions = defineFunctions({
  // Token Functions
  total_supply: {
    args: [
      getSelfArg()
    ],
    returns: 'i128',
    code: [
      'fungible::total_supply(e)'
    ]
  },
  balance: {
    args: [
      getSelfArg(),
      { name: 'account', type: 'Address' }
    ],
    returns: 'i128',
    code: [
      'fungible::balance(e, &account)'
    ]
  },
  allowance: {
    args: [
      getSelfArg(),
      { name: 'owner', type: 'Address' },
      { name: 'spender', type: 'Address' }
    ],
    returns: 'i128',
    code: [
      'fungible::allowance(e, &owner, &spender)'
    ]
  },
  transfer: {
    args: [
      getSelfArg(),
      { name: 'from', type: 'Address' },
      { name: 'to', type: 'Address' },
      { name: 'amount', type: 'i128' }
    ],
    code: [
      'fungible::transfer(e, &from, &to, amount)'
    ]
  },
  transfer_from: {
    args: [
      getSelfArg(),
      { name: 'spender', type: 'Address' },
      { name: 'from', type: 'Address' },
      { name: 'to', type: 'Address' },
      { name: 'amount', type: 'i128' }
    ],
    code: [
      'fungible::transfer_from(e, &spender, &from, &to, amount)'
    ]
  },
  approve: {
    args: [
      getSelfArg(),
      { name: 'owner', type: 'Address' },
      { name: 'spender', type: 'Address' },
      { name: 'amount', type: 'i128' },
      { name: 'live_until_ledger', type: 'u32' }
    ],
    code: [
      'fungible::approve(e, &owner, &spender, amount, live_until_ledger)'
    ]
  },
  decimals: {
    args: [
      getSelfArg()
    ],
    returns: 'u32',
    code: [
      'fungible::metadata::decimals(e)'
    ]
  },
  name: {
    args: [
      getSelfArg()
    ],
    returns: 'String',
    code: [
      'fungible::metadata::name(e)'
    ]
  },
  symbol: {
    args: [
      getSelfArg()
    ],
    returns: 'String',
    code: [
      'fungible::metadata::symbol(e)'
    ]
  },

  // Extensions
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
