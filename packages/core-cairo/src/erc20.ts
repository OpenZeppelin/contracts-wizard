import { Contract, ContractBuilder } from './contract';
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

  if (allOpts.premint) {
    addPremint(c, allOpts.premint);
  }

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

  if (allOpts.safeAllowance) {
    addSafeAllowance(c);
  }

  setAccessControl(c, allOpts.access);
  setUpgradeable(c, allOpts.upgradeable, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
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

function addSafeAllowance(c: ContractBuilder) {
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
        name: 'ERC20Impl',
        value: 'ERC20Component::ERC20Impl<ContractState>',
      },
      {
        name: 'ERC20MetadataImpl',
        value: 'ERC20Component::ERC20MetadataImpl<ContractState>',
      },
      {
        name: 'ERC20CamelOnlyImpl',
        value: 'ERC20Component::ERC20CamelOnlyImpl<ContractState>',
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
  }
});
