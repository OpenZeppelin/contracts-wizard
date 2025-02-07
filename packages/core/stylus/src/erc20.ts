import { Contract, ContractBuilder } from './contract';
import { addPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { CommonContractOptions, withCommonContractDefaults, getSelfArg } from './common-options';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';


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

  if (allOpts.pausable) {
    addPausable(c, allOpts.access);
  }

  if (allOpts.burnable) {
    addBurnable(c, allOpts.pausable);
  }

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


  c.addStorage('erc20', 'Erc20');
  c.addImplementedTrait(erc20Trait);

  c.addStorage('metadata', 'Erc20Metadata');
  c.addImplementedTrait(erc20MetadataTrait);

  // c.addFunction(erc20Trait, functions.total_supply);
  // c.addFunction(erc20Trait, functions.balance);
  // c.addFunction(erc20Trait, functions.allowance);
  // c.addFunction(erc20Trait, functions.transfer);
  // c.addFunction(erc20Trait, functions.transfer_from);
  // c.addFunction(erc20Trait, functions.approve);
  // c.addFunction(erc20Trait, functions.decimals);
  // c.addFunction(erc20Trait, functions.name);
  // c.addFunction(erc20Trait, functions.symbol);

  if (pausable) {
    c.addUseClause('openzeppelin_pausable_macros', 'when_not_paused')
    c.addFunctionTag(erc20Trait, functions.transfer, 'when_not_paused');
    c.addFunctionTag(erc20Trait, functions.transfer_from, 'when_not_paused');
  }
}

function addBurnable(c: ContractBuilder, pausable: boolean) {
  c.addUseClause('openzeppelin_erc20_token', 'burnable::ERC20Burnable');
  c.addUseClause('soroban_sdk', 'Address');

  c.addFunction(erc20Trait, functions.burn);
  c.addFunction(erc20Trait, functions.burn_from);

  if (pausable) {
    c.addUseClause('openzeppelin_pausable_macros', 'when_not_paused')
    c.addFunctionTag(erc20Trait, functions.burn, 'when_not_paused');
    c.addFunctionTag(erc20Trait, functions.burn_from, 'when_not_paused');
  }
}

const erc20Trait = {
  name: 'Erc20',
};

const erc20MetadataTrait = {
  name: 'Erc20Metadata',
}

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
