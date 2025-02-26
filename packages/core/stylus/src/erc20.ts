import { BaseImplementedTrait, Contract, ContractBuilder } from './contract';
import { addPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { CommonContractOptions, withCommonContractDefaults, getSelfArg } from './common-options';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { setAccessControl } from './set-access-control';
import { setInfo } from './set-info';

export interface ERC20Options extends CommonContractOptions {
  name: string;
  burnable?: boolean;
  pausable?: boolean;
  permit?: boolean;
}

export const defaults: Required<ERC20Options> = {
  name: 'MyToken',
  burnable: false,
  pausable: false,
  permit: true,
  access: commonDefaults.access,
  info: commonDefaults.info
} as const;

export function printERC20(opts: ERC20Options = defaults): string {
  return printContract(buildERC20(opts));
}

function withDefaults(opts: ERC20Options): Required<ERC20Options> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    permit: opts.permit ?? defaults.permit,
  };
}

export function isAccessControlRequired(opts: Required<ERC20Options>): boolean {
  return opts.pausable;
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

  if (allOpts.permit) {
    addPermit(c, allOpts.pausable);
  }

  setAccessControl(c, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

function addBase(c: ContractBuilder, pausable: boolean) {
  // Add the base traits
  c.addUseClause('openzeppelin_stylus::token::erc20', 'Erc20');
  c.addUseClause('openzeppelin_stylus::token::erc20', 'IErc20');
  c.addImplementedTrait(erc20Trait);

  // c.addUseClause('openzeppelin_stylus::token::erc20::extensions', 'Erc20Metadata');
  // c.addImplementedTrait(erc20MetadataTrait);
  
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

function addPermit(c: ContractBuilder, pausable: boolean) {
  c.addUseClause('openzeppelin_stylus::token::erc20::extensions', 'Erc20Permit');
  c.addUseClause('openzeppelin_stylus::utils::cryptography::eip712', 'IEip712');
  
  c.addUseClause('alloc::vec', 'Vec');
  c.addUseClause('alloy_primitives', 'Address');
  c.addUseClause('alloy_primitives', 'B256');
  c.addUseClause('alloy_primitives', 'U256');

  c.addImplementedTrait(erc20PermitTrait);
  c.addImplementedTrait(noncesTrait);

  c.addEip712("ERC-20 Permit Example", "1");

  c.addFunction(erc20PermitTrait, functions.permit);

  if (pausable) {   
    c.addFunctionCodeBefore(erc20PermitTrait, functions.permit, [
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

const erc20Trait: BaseImplementedTrait = {
  name: 'Erc20',
  storage: {
    name: 'erc20',
    type: 'Erc20',
  }
};

const erc20PermitTrait: BaseImplementedTrait = {
  name: 'Erc20Permit<Eip712>',
  storage: {
    name: 'erc20_permit',
    type: 'Erc20Permit<Eip712>',
  }
};

const noncesTrait: BaseImplementedTrait = {
  name: 'Nonces',
  storage: {
    name: 'nonces',
    type: 'Nonces',
  }
};

// const erc20MetadataTrait: BaseImplementedTrait = {
//   name: 'Erc20Metadata',
//   storage: {
//     name: 'metadata',
//     type: 'Erc20Metadata',
//   }
// }

const functions = defineFunctions({
  // Token Functions
  transfer: {
    args: [
      getSelfArg(),
      { name: 'to', type: 'Address' },
      { name: 'value', type: 'U256' },
    ],
    returns: 'Result<bool, Vec<u8>>',
    code: [
      `self.${erc20Trait.storage.name}.transfer(to, value).map_err(|e| e.into())`,
    ],
  },
  transfer_from: {
    args: [
      getSelfArg(),
      { name: 'from', type: 'Address' },
      { name: 'to', type: 'Address' },
      { name: 'value', type: 'U256' },
    ],
    returns: 'Result<bool, Vec<u8>>',
    code: [
      `self.${erc20Trait.storage.name}.transfer_from(from, to, value).map_err(|e| e.into())`,
    ],
  },

  // Overrides
  // supports_interface: {
  //   args: [
  //     { name: 'interface_id', type: 'FixedBytes<4>' },
  //   ],
  //   returns: 'bool',
  //   code: [
  //     'Erc20::supports_interface(interface_id) || Erc20Metadata::supports_interface(interface_id)'
  //   ]
  // },

  // Extensions
  burn: {
    args: [getSelfArg(), { name: 'value', type: 'U256' }],
    returns: 'Result<(), Vec<u8>>',
    code: [`self.${erc20Trait.storage.name}.burn(value).map_err(|e| e.into())`],
  },
  burn_from: {
    args: [
      getSelfArg(),
      { name: 'account', type: 'Address' },
      { name: 'value', type: 'U256' },
    ],
    returns: 'Result<(), Vec<u8>>',
    code: [
      `self.${erc20Trait.storage.name}.burn_from(account, value).map_err(|e| e.into())`,
    ],
  },

  permit: {
    attribute: 'allow(clippy::too_many_arguments)',
    args: [
      getSelfArg(),
      { name: 'owner', type: 'Address' },
      { name: 'spender', type: 'Address' },
      { name: 'value', type: 'U256' },
      { name: 'deadline', type: 'U256' },
      { name: 'v', type: 'u8' },
      { name: 'r', type: 'B256' },
      { name: 's', type: 'B256' },
    ],
    returns: 'Result<(), Vec<u8>>',
    code: [
      `self.${erc20PermitTrait.storage.name}.permit(owner, spender, value, deadline, v, r, s, &mut self.erc20, &mut self.nonces).map_err(|e| e.into())`,
    ],
  },
});
