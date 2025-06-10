import type { BaseImplementedTrait, Contract } from './contract';
import { ContractBuilder } from './contract';
import { defineFunctions } from './utils/define-functions';
import type { CommonContractOptions } from './common-options';
import { withCommonContractDefaults, getSelfArg } from './common-options';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { setAccessControl } from './set-access-control';
import { setInfo } from './set-info';

export interface ERC20Options extends CommonContractOptions {
  name: string;
  burnable?: boolean;
  // pausable?: boolean;
  permit?: boolean;
  flashmint?: boolean;
}

export const defaults: Required<ERC20Options> = {
  name: 'MyToken',
  burnable: false,
  // pausable: false,
  permit: true,
  flashmint: false,
  access: commonDefaults.access,
  info: commonDefaults.info,
} as const;

export function printERC20(opts: ERC20Options = defaults): string {
  return printContract(buildERC20(opts));
}

function withDefaults(opts: ERC20Options): Required<ERC20Options> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    // pausable: opts.pausable ?? defaults.pausable,
    permit: opts.permit ?? defaults.permit,
    flashmint: opts.flashmint ?? defaults.flashmint,
  };
}

export function isAccessControlRequired(_opts: Partial<ERC20Options>): boolean {
  // return opts.pausable === true;
  return false;
}

export function buildERC20(opts: ERC20Options): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  addBase(c);

  // if (allOpts.pausable) {
  //   addPausable(c, allOpts.access);
  // }

  if (allOpts.burnable) {
    addBurnable(c);
  }

  if (allOpts.permit) {
    addPermit(c);
  }

  if (allOpts.flashmint) {
    addFlashMint(c);
  }

  setAccessControl(c, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

function addBase(c: ContractBuilder) {
  c.addImplementedTrait(erc20Trait);
  // c.addImplementedTrait(erc20MetadataTrait);

  c.addUseClause('alloc::vec', 'Vec');
  c.addUseClause('stylus_sdk::alloy_primitives', 'Address');
  c.addUseClause('stylus_sdk::alloy_primitives', 'U256');

  // if (pausable) {
  //   c.addFunctionCodeBefore(erc20Trait, functions.transfer, ['self.pausable.when_not_paused()?;']);
  //   c.addFunctionCodeBefore(erc20Trait, functions.transfer_from, ['self.pausable.when_not_paused()?;']);
  // }
}

function addPermit(c: ContractBuilder) {
  c.addImplementedTrait(noncesTrait);
  c.addImplementedTrait(erc20PermitTrait);
  c.addEip712();

  c.addUseClause('stylus_sdk::alloy_primitives', 'B256');

  // if (pausable) {
  //   c.addFunctionCodeBefore(erc20PermitTrait, functions.permit, ['self.pausable.when_not_paused()?;']);
  // }
}

function addBurnable(c: ContractBuilder) {
  c.addUseClause('openzeppelin_stylus::token::erc20::extensions', 'IErc20Burnable');

  c.addFunction(functions.burn, erc20Trait);
  c.addFunction(functions.burn_from, erc20Trait);

  // if (pausable) {
  //   c.addFunctionCodeBefore(erc20Trait, functions.burn, ['self.pausable.when_not_paused()?;']);
  //   c.addFunctionCodeBefore(erc20Trait, functions.burn_from, ['self.pausable.when_not_paused()?;']);
  // }
}

function addFlashMint(c: ContractBuilder) {
  c.addImplementedTrait(flashMintTrait);

  // the trait necessary to access Erc20FlashMint functions within custom functions of the child contract
  c.addUseClause('openzeppelin_stylus::token::erc20::extensions', 'IErc3156FlashLender');

  c.addUseClause('stylus_sdk', 'abi::Bytes');

  c.addFunction(functions.max_flash_loan, flashMintTrait);
  c.addFunction(functions.flash_fee, flashMintTrait);
  c.addFunction(functions.flash_loan, flashMintTrait);

  // if (pausable) {
  //   c.addFunctionCodeBefore(flashMintTrait, functions.flash_loan, ['self.pausable.when_not_paused()?;']);
  // }
}

const erc20Trait: BaseImplementedTrait = {
  name: 'Erc20',
  interface: {
    name: 'IErc20',
    associatedError: true,
  },
  storage: {
    name: 'erc20',
    type: 'Erc20',
  },
  modulePath: 'openzeppelin_stylus::token::erc20',
  functions: [
    {
      name: 'total_supply',
      args: [getSelfArg('immutable')],
      returns: 'U256',
      code: [`self.erc20.total_supply()`],
    },
    {
      name: 'transfer',
      args: [getSelfArg('immutable'), { name: 'account', type: 'Address' }],
      returns: 'U256',
      code: [`self.erc20.transfer(account)`],
    },
    {
      name: 'transfer',
      args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'value', type: 'U256' }],
      returns: 'Result<bool, Self::Error>',
      code: [`self.erc20.transfer(to, value).map_err(|e| e.into())`],
    },
    {
      name: 'allowance',
      args: [getSelfArg('immutable'), { name: 'owner', type: 'Address' }, { name: 'spender', type: 'Address' }],
      returns: 'U256',
      code: [`self.erc20.allowance(owner, spender)`],
    },
    {
      name: 'transfer_from',
      args: [
        getSelfArg(),
        { name: 'from', type: 'Address' },
        { name: 'to', type: 'Address' },
        { name: 'value', type: 'U256' },
      ],
      returns: 'Result<bool, Self::Error>',
      code: [`self.erc20.transfer_from(from, to, value).map_err(|e| e.into())`],
    },
  ],
};

const noncesTrait: BaseImplementedTrait = {
  name: 'Nonces',
  interface: {
    name: 'INonces',
  },
  storage: {
    name: 'nonces',
    type: 'Nonces',
  },
  modulePath: 'openzeppelin_stylus::utils::nonces',
  functions: [
    {
      name: 'nonces',
      args: [getSelfArg('immutable'), { name: 'owner', type: 'Address' }],
      code: ['self.nonces.nonces(owner)'],
      returns: 'U256'
    }
  ]
};

const erc20PermitTrait: BaseImplementedTrait = {
  name: 'Erc20Permit',
  interface: {
    name: 'IErc20Permit',
    associatedError: true,
  },
  storage: {
    name: 'erc20_permit',
    type: 'Erc20Permit<Eip712>',
  },
  modulePath: 'openzeppelin_stylus::token::erc20::extensions',
  functions: [
    {
      name: 'domain_separator',
      attribute: 'selector(name = "DOMAIN_SEPARATOR")',
      args: [getSelfArg('immutable')],
      returns: 'B256',
      code: [`self.erc20_permit.domain_separator()`],
    },
    {
      name: 'permit',
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
      returns: 'Result<(), Self::Error>',
      code: [
        `self.erc20_permit.permit(owner, spender, value, deadline, v, r, s, &mut self.${erc20Trait.storage.name}, &mut self.${noncesTrait.storage.name}).map_err(|e| e.into())`,
      ],
    }
  ],
};

const flashMintTrait: BaseImplementedTrait = {
  name: 'Erc20FlashMint',
  interface: {
    name: 'IErc3156FlashLender',
    associatedError: true,
  },
  storage: {
    name: 'flash_mint',
    type: 'Erc20FlashMint',
  },
  modulePath: 'openzeppelin_stylus::token::erc20::extensions',
};

// const erc20MetadataTrait: BaseImplementedTrait = {
//   name: 'Erc20Metadata',
//   interface: 'IErc20Metadata',
//   storage: {
//     name: 'metadata',
//     type: 'Erc20Metadata',
//   }
//   modulePath: 'openzeppelin_stylus::token::erc20::extensions',
// }

const functions = defineFunctions({
  // Extensions
  burn: {
    args: [getSelfArg(), { name: 'value', type: 'U256' }],
    returns: 'Result<(), Vec<u8>>',
    code: [`self.${erc20Trait.storage.name}.burn(value).map_err(|e| e.into())`],
  },
  burn_from: {
    args: [getSelfArg(), { name: 'account', type: 'Address' }, { name: 'value', type: 'U256' }],
    returns: 'Result<(), Vec<u8>>',
    code: [`self.${erc20Trait.storage.name}.burn_from(account, value).map_err(|e| e.into())`],
  },

  max_flash_loan: {
    args: [getSelfArg('immutable'), { name: 'token', type: 'Address' }],
    returns: 'U256',
    code: [`self.${flashMintTrait.storage.name}.max_flash_loan(token, &self.${erc20Trait.storage.name})`],
  },
  flash_fee: {
    args: [getSelfArg('immutable'), { name: 'token', type: 'Address' }, { name: 'value', type: 'U256' }],
    returns: 'Result<U256, Vec<u8>>',
    code: [`self.${flashMintTrait.storage.name}.flash_fee(token, value).map_err(|e| e.into())`],
  },
  flash_loan: {
    args: [
      getSelfArg(),
      { name: 'receiver', type: 'Address' },
      { name: 'token', type: 'Address' },
      { name: 'value', type: 'U256' },
      { name: 'data', type: 'Bytes' },
    ],
    returns: 'Result<bool, Vec<u8>>',
    code: [
      `self.${flashMintTrait.storage.name}.flash_loan(receiver, token, value, data, &mut self.${erc20Trait.storage.name}).map_err(|e| e.into())`,
    ],
  },
});
