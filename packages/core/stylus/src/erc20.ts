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


export const defaults: Required<ERC20Options> = {
  name: 'MyToken',
  burnable: false,
  pausable: false,
  mintable: false,
  access: commonDefaults.access,
  info: commonDefaults.info
} as const;

export function printERC20(opts: ERC20Options = defaults): string {
  return printContract(buildERC20(opts));
}

export interface ERC20Options extends CommonContractOptions {
  name: string;
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
}

function withDefaults(opts: ERC20Options): Required<ERC20Options> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    mintable: opts.mintable ?? defaults.mintable,
  };
}

export function buildERC20(opts: ERC20Options): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  addBase(c, allOpts.pausable);

  // if (allOpts.pausable) {
  //   addPausable(c, allOpts.access);
  // }

  if (allOpts.burnable) {
    addBurnable(c, allOpts.pausable);
  }

  // if (allOpts.mintable) {
  //   addMintable(c, allOpts.access, allOpts.pausable);
  // }

  // setAccessControl(c, allOpts.access);
  // setInfo(c, allOpts.info);

  return c;
}

function addBase(c: ContractBuilder, pausable: boolean) {
  // Set token functions
  c.addUseClause('openzeppelin_stylus::token::erc20', 'Erc20');
  c.addUseClause('openzeppelin_stylus::token::erc20', 'IErc20');
  c.addUseClause('openzeppelin_stylus::token::erc20::extensions', 'Erc20Metadata');

  // c.addUseClause('openzeppelin_erc20_token', 'ERC20Token');
  // c.addUseClause('soroban_sdk', 'contract');
  // c.addUseClause('soroban_sdk', 'contractimpl');
  // c.addUseClause('soroban_sdk', 'Address');
  // c.addUseClause('soroban_sdk', 'String');
  // c.addUseClause('soroban_sdk', 'Env');
  // c.addUseClause('soroban_sdk', 'Symbol');

  const erc20Trait = {
    name: 'Erc20',
    tags: [
      'public',
    ],
  };
  c.addStorage('erc20', 'Erc20');

  c.addFunction(erc20Trait, functions.total_supply);
  c.addFunction(erc20Trait, functions.balance);
  c.addFunction(erc20Trait, functions.allowance);
  c.addFunction(erc20Trait, functions.transfer);
  c.addFunction(erc20Trait, functions.transfer_from);
  c.addFunction(erc20Trait, functions.approve);
  c.addFunction(erc20Trait, functions.decimals);
  c.addFunction(erc20Trait, functions.name);
  c.addFunction(erc20Trait, functions.symbol);

  if (pausable) {
    c.addUseClause('openzeppelin_pausable_macros', 'when_not_paused')
    c.addFunctionTag(erc20Trait, functions.transfer, 'when_not_paused');
    c.addFunctionTag(erc20Trait, functions.transfer_from, 'when_not_paused');
  }
}

function addBurnable(c: ContractBuilder, pausable: boolean) {
  c.addUseClause('openzeppelin_erc20_token', 'burnable::ERC20Burnable');
  c.addUseClause('soroban_sdk', 'Address');

  const erc20BurnableTrait = {
    name: 'ERC20Burnable',
    for: c.name,
    tags: [
      'contractimpl',
    ],
    section: 'Extensions',
  }

  c.addFunction(erc20BurnableTrait, functions.burn);
  c.addFunction(erc20BurnableTrait, functions.burn_from);

  if (pausable) {
    c.addUseClause('openzeppelin_pausable_macros', 'when_not_paused')
    c.addFunctionTag(erc20BurnableTrait, functions.burn, 'when_not_paused');
    c.addFunctionTag(erc20BurnableTrait, functions.burn_from, 'when_not_paused');
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

    c.addUseClause('openzeppelin_erc20_token', 'mintable::ERC20Mintable');
    c.addUseClause('soroban_sdk', 'Address');

    c.addConstructorArgument({ name:'owner', type:'Address' });
    c.addConstructorCode(`erc20::mintable::mint(e, &owner, ${premintAbsolute});`);
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

// function addMintable(c: ContractBuilder, access: Access, pausable: boolean) {
//   c.addUseClause('openzeppelin_erc20_token', 'mintable::ERC20Mintable');

//   const erc20MintableTrait = {
//     name: 'ERC20Mintable',
//     for: c.name,
//     tags: [
//       'contractimpl',
//     ],
//     section: 'Extensions',
//   }

//   c.addFunction(erc20MintableTrait, functions.mint);

//   requireAccessControl(c, erc20MintableTrait, functions.mint, access);

//   if (pausable) {
//     c.addFunctionTag(erc20MintableTrait, functions.mint, 'when_not_paused');
//   }
// }

const functions = defineFunctions({
  // Token Functions
  total_supply: {
    args: [
      getSelfArg()
    ],
    returns: 'i128',
    code: [
      'erc20::total_supply(e)'
    ]
  },
  balance: {
    args: [
      getSelfArg(),
      { name: 'account', type: 'Address' }
    ],
    returns: 'i128',
    code: [
      'erc20::balance(e, &account)'
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
      'erc20::allowance(e, &owner, &spender)'
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
      'erc20::transfer(e, &from, &to, amount)'
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
      'erc20::transfer_from(e, &spender, &from, &to, amount)'
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
      'erc20::approve(e, &owner, &spender, amount, live_until_ledger)'
    ]
  },
  decimals: {
    args: [
      getSelfArg()
    ],
    returns: 'u32',
    code: [
      'erc20::metadata::decimals(e)'
    ]
  },
  name: {
    args: [
      getSelfArg()
    ],
    returns: 'String',
    code: [
      'erc20::metadata::name(e)'
    ]
  },
  symbol: {
    args: [
      getSelfArg()
    ],
    returns: 'String',
    code: [
      'erc20::metadata::symbol(e)'
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
      'erc20::burnable::burn(e, &from, amount)'
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
      'erc20::burnable::burn_from(e, &spender, &from, amount)'
    ]
  },
  mint: {
    args: [
      getSelfArg(),
      { name: 'account', type: 'Address' },
      { name: 'amount', type: 'i128' }
    ],
    code: [
      'erc20::mintable::mint(e, &account, amount);'
    ]
  },
});
