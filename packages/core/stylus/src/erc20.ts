import { Contract, ContractBuilder } from './contract';
import { addPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { CommonContractOptions, withCommonContractDefaults, getSelfArg } from './common-options';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { setAccessControl } from './set-access-control';
import { setInfo } from './set-info';

export const defaults: Required<ERC20Options> = {
  name: 'MyToken',
  burnable: false,
  pausable: false,
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
}

function withDefaults(opts: ERC20Options): Required<ERC20Options> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
  };
}

export function isAccessControlRequired(opts: Partial<ERC20Options>): boolean {
  return opts.pausable === true;
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

  setAccessControl(c, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

function addBase(c: ContractBuilder, pausable: boolean) {
  c.addUseClause('openzeppelin_stylus::token::erc20', 'Erc20');
  c.addUseClause('openzeppelin_stylus::token::erc20', 'IErc20');
  c.addUseClause('openzeppelin_stylus::token::erc20::extensions', 'Erc20Metadata');

  c.addImplementedTrait(erc20Trait);
  c.addImplementedTrait(erc20MetadataTrait);

  if (pausable) {
    c.addUseClause('alloc::vec', 'Vec');
    c.addUseClause('alloy_primitives', 'Address');
    c.addUseClause('alloy_primitives', 'U256');

    c.addFunctionCodeBefore(erc20Trait, functions.transfer, [
      'self.pausable.when_not_paused()?;',
    ]);
    c.addFunctionCodeBefore(erc20Trait, functions.transfer_from, [
      'self.pausable.when_not_paused()?;',
    ]);
  }
}

function addBurnable(c: ContractBuilder, pausable: boolean) {
  c.addUseClause('openzeppelin_stylus::token::erc20::extensions', 'IErc20Burnable');

  c.addUseClause('alloc::vec', 'Vec');
  c.addUseClause('alloy_primitives', 'Address');
  c.addUseClause('alloy_primitives', 'U256');

  c.addFunction(erc20Trait, functions.burn);
  c.addFunction(erc20Trait, functions.burn_from);

  if (pausable) {
    c.addFunctionCodeBefore(erc20Trait, functions.burn, [
      'self.pausable.when_not_paused()?;',
    ]);
    c.addFunctionCodeBefore(erc20Trait, functions.burn_from, [
      'self.pausable.when_not_paused()?;',
    ]);
  }
}

const erc20Trait = {
  name: 'Erc20',
  storage: {
    name: 'erc20',
    type: 'Erc20',
  }
};

const erc20MetadataTrait = {
  name: 'Erc20Metadata',
  storage: {
    name: 'metadata',
    type: 'Erc20Metadata',
  }
}

const functions = defineFunctions({
  // Token Functions
  transfer: {
    args: [
      getSelfArg(),
      { name: 'to', type: 'Address' },
      { name: 'value', type: 'U256' },
    ],
    returns: 'Result<bool, Vec<u8>>',
    visibility: 'pub',
    code: [
      'self.erc20.transfer(to, value).map_err(|e| e.into())'
    ]
  },
  transfer_from: {
    args: [
      getSelfArg(),
      { name: 'from', type: 'Address' },
      { name: 'to', type: 'Address' },
      { name: 'value', type: 'U256' },
    ],
    returns: 'Result<bool, Vec<u8>>',
    visibility: 'pub',
    code: [
      'self.erc20.transfer_from(from, to, value).map_err(|e| e.into())'
    ]
  },

  // Extensions
  burn: {
    args: [
      getSelfArg(),
      { name: 'value', type: 'U256' },
    ],
    returns: 'Result<(), Vec<u8>>',
    visibility: 'pub',
    code: [
      'self.erc20.burn(value).map_err(|e| e.into())'
    ]
  },
  burn_from: {
    args: [
      getSelfArg(),
      { name: 'account', type: 'Address' },
      { name: 'value', type: 'U256' },
    ],
    returns: 'Result<(), Vec<u8>>',
    visibility: 'pub',
    code: [
      'self.erc20.burn_from(account, value).map_err(|e| e.into())'
    ]
  },
});
