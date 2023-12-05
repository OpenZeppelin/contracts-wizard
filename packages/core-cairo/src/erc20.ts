import { BaseImplementedTrait, Contract, ContractBuilder } from './contract';
import { Access, requireAccessControl, setAccessControl } from './set-access-control';
import { addPausable, setPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults, getSelfArg } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { OptionsError } from './error';
import { defineComponents } from './utils/define-components';
import { defaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { externalTrait } from './external-trait';

export const defaults: Required<ERC20Options> = {
  name: 'MyToken',
  symbol: 'MTK',
  burnable: false,
  pausable: false,
  premint: '0',
  mintable: false,
  safeAllowance: false,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info
} as const;

export function printERC20(opts: ERC20Options = defaults): string {
  return printContract(buildERC20(opts));
}

export interface ERC20Options extends CommonOptions {
  name: string;
  symbol: string;
  burnable?: boolean;
  pausable?: boolean;
  premint?: string;
  mintable?: boolean;
  safeAllowance?: boolean;
}

function withDefaults(opts: ERC20Options): Required<ERC20Options> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    premint: opts.premint || defaults.premint,
    mintable: opts.mintable ?? defaults.mintable,
    safeAllowance: opts.safeAllowance ?? defaults.safeAllowance,
  };
}

export function isAccessControlRequired(opts: Partial<ERC20Options>): boolean {
  return opts.mintable === true || opts.pausable === true || opts.upgradeable === true;
}

export function buildERC20(opts: ERC20Options): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  addBase(c, allOpts.name, allOpts.symbol);
  addERC20ImplAndCamelOnlyImpl(c, allOpts.pausable);

  if (allOpts.safeAllowance) {
    addSafeAllowance(c, allOpts.pausable);
  }

  if (allOpts.premint) {
    addPremint(c, allOpts.premint);
  }

  if (allOpts.burnable) {
    addBurnable(c);
  }

  if (allOpts.pausable) {
    addPausable(c, allOpts.access);
    if (allOpts.burnable) {
      setPausable(c, externalTrait, functions.burn);
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

function addERC20ImplAndCamelOnlyImpl(c: ContractBuilder, pausable: boolean) {
  if (pausable) {
    c.addStandaloneImport('openzeppelin::token::erc20::interface::IERC20');
    const ERC20Impl: BaseImplementedTrait = {
      name: 'ERC20Impl',
      of: 'IERC20<ContractState>',
      tags: [
        '#[external(v0)]'
      ],
    }
    c.addFunction(ERC20Impl, functions.total_supply);
    c.addFunction(ERC20Impl, functions.balance_of);
    c.addFunction(ERC20Impl, functions.allowance);
    setPausable(c, ERC20Impl, functions.transfer);
    setPausable(c, ERC20Impl, functions.transfer_from);
    setPausable(c, ERC20Impl, functions.approve);

    c.addStandaloneImport('openzeppelin::token::erc20::interface::IERC20CamelOnly');
    const ERC20CamelOnlyImpl: BaseImplementedTrait = {
      name: 'ERC20CamelOnlyImpl',
      of: 'IERC20CamelOnly<ContractState>',
      tags: [
        '#[external(v0)]'
      ],
    }
    c.addFunction(ERC20CamelOnlyImpl, functions.totalSupply);
    c.addFunction(ERC20CamelOnlyImpl, functions.balanceOf);
    setPausable(c, ERC20CamelOnlyImpl, functions.transferFrom);
  } else {
    c.addImplToComponent(components.ERC20Component, {
      name: 'ERC20Impl',
      value: 'ERC20Component::ERC20Impl<ContractState>',
    });
    c.addImplToComponent(components.ERC20Component,     {
      name: 'ERC20CamelOnlyImpl',
      value: 'ERC20Component::ERC20CamelOnlyImpl<ContractState>',
    });
  }
}

function addBase(c: ContractBuilder, name: string, symbol: string) {
  c.addComponent(
    components.ERC20Component,
    [
      name, symbol
    ],
    true,
  );
}

function addSafeAllowance(c: ContractBuilder, pausable: boolean) {
  if (pausable) {
    c.addStandaloneImport('openzeppelin::token::erc20::interface::ISafeAllowance');
    const SafeAllowanceImpl: BaseImplementedTrait = {
      name: 'SafeAllowanceImpl',
      of: 'ISafeAllowance<ContractState>',
      tags: [
        '#[external(v0)]'
      ],
    }
    setPausable(c, SafeAllowanceImpl, functions.increase_allowance);
    setPausable(c, SafeAllowanceImpl, functions.decrease_allowance);

    c.addStandaloneImport('openzeppelin::token::erc20::interface::ISafeAllowanceCamel');
    const SafeAllowanceCamelImpl: BaseImplementedTrait = {
      name: 'SafeAllowanceCamelImpl',
      of: 'ISafeAllowanceCamel<ContractState>',
      tags: [
        '#[external(v0)]'
      ],
    }
    setPausable(c, SafeAllowanceCamelImpl, functions.increaseAllowance);
    setPausable(c, SafeAllowanceCamelImpl, functions.decreaseAllowance);
  } else {
    c.addImplToComponent(components.ERC20Component, 
      {
        name: 'SafeAllowanceImpl',
        value: 'ERC20Component::SafeAllowanceImpl<ContractState>',
      },
    );
    c.addImplToComponent(components.ERC20Component,
      {
        name: 'SafeAllowanceCamelImpl',
        value: 'ERC20Component::SafeAllowanceCamelImpl<ContractState>',
      },
    );  
  }
}

function addBurnable(c: ContractBuilder) {
  c.addStandaloneImport('starknet::get_caller_address');
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

    c.addStandaloneImport('starknet::ContractAddress');
    c.addConstructorArgument({ name:'recipient', type:'ContractAddress' });
    c.addConstructorCode(`self.erc20._mint(recipient, ${amount})`); 
  }
}

function addMintable(c: ContractBuilder, access: Access) {
  c.addStandaloneImport('starknet::ContractAddress');
  requireAccessControl(c, externalTrait, functions.mint, access, 'MINTER', 'minter');
}

const components = defineComponents( {
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
        name: 'ERC20MetadataImpl',
        value: 'ERC20Component::ERC20MetadataImpl<ContractState>',
      },    
    ],
    internalImpl: {
      name: 'ERC20InternalImpl',
      value: 'ERC20Component::InternalImpl<ContractState>',
    },
  },
});

const functions = defineFunctions({
  burn: {
    args: [
      getSelfArg(),
      { name: 'value', type: 'u256' }
    ],
    code: [
      'let caller = get_caller_address();',
      'self.erc20._burn(caller, value);'
    ]
  },
  mint: {
    args: [
      getSelfArg(),
      { name: 'recipient', type: 'ContractAddress' },
      { name: 'amount', type: 'u256' }
    ],
    code: [
      'self.erc20._mint(recipient, amount);'
    ]
  },

  // Re-implements ERC20Impl
  total_supply: {
    args: [
      getSelfArg('view')
    ],
    code: [
      'self.erc20.total_supply()'
    ],
    returns : 'u256',
  },
  balance_of: {
    args: [
      getSelfArg('view'),
      { name: 'account', type: 'ContractAddress' },
    ],
    code: [
      'self.erc20.balance_of(account)'
    ],
    returns : 'u256',
  },
  allowance: {
    args: [
      getSelfArg('view'),
      { name: 'owner', type: 'ContractAddress' },
      { name: 'spender', type: 'ContractAddress' },
    ],
    code: [
      'self.erc20.allowance(owner, spender)'
    ],
    returns : 'u256',
  },
  transfer: {
    args: [
      getSelfArg(),
      { name: 'recipient', type: 'ContractAddress' },
      { name: 'amount', type: 'u256' },
    ],
    code: [
      'self.erc20.transfer(recipient, amount)',
    ],
    returns : 'bool',
  },
  transfer_from: {
    args: [
      getSelfArg(),
      { name: 'sender', type: 'ContractAddress' },
      { name: 'recipient', type: 'ContractAddress' },
      { name: 'amount', type: 'u256' },
    ],
    code: [
      'self.erc20.transfer_from(sender, recipient, amount)',
    ],
    returns : 'bool',
  },
  approve: {
    args: [
      getSelfArg(),
      { name: 'spender', type: 'ContractAddress' },
      { name: 'amount', type: 'u256' },
    ],
    code: [
      'self.erc20.approve(spender, amount)',
    ],
    returns : 'bool',
  },

  // Re-implements ERC20CamelOnlyImpl
  totalSupply: {
    args: [
      getSelfArg('view')
    ],
    code: [
      'self.total_supply()'
    ],
    returns : 'u256',
  },
  balanceOf: {
    args: [
      getSelfArg('view'),
      { name: 'account', type: 'ContractAddress' },
    ],
    code: [
      'self.balance_of(account)'
    ],
    returns : 'u256',
  },
  transferFrom: {
    args: [
      getSelfArg(),
      { name: 'sender', type: 'ContractAddress' },
      { name: 'recipient', type: 'ContractAddress' },
      { name: 'amount', type: 'u256' },
    ],
    code: [
      'self.transfer_from(sender, recipient, amount)',
    ],
    returns : 'bool',
  },

  // Re-implements SafeAllowanceImpl
  increase_allowance: {
    args: [
      getSelfArg(),
      { name: 'spender', type: 'ContractAddress' },
      { name: 'added_value', type: 'u256' },
    ],
    code: [
      'self.erc20.increase_allowance(spender, added_value)'
    ],
    returns : 'bool',
  },
  decrease_allowance: {
    args: [
      getSelfArg(),
      { name: 'spender', type: 'ContractAddress' },
      { name: 'subtracted_value', type: 'u256' },
    ],
    code: [
      'self.erc20.decrease_allowance(spender, subtracted_value)'
    ],
    returns : 'bool',
  },

  // Re-implements SafeAllowanceCamelImpl
  increaseAllowance: {
    args: [
      getSelfArg(),
      { name: 'spender', type: 'ContractAddress' },
      { name: 'addedValue', type: 'u256' },
    ],
    code: [
      'self.increase_allowance(spender, addedValue)'
    ],
    returns : 'bool',
  },
  decreaseAllowance: {
    args: [
      getSelfArg(),
      { name: 'spender', type: 'ContractAddress' },
      { name: 'subtractedValue', type: 'u256' },
    ],
    code: [
      'self.decrease_allowance(spender, subtractedValue)'
    ],
    returns : 'bool',
  },
});
