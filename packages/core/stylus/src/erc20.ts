import type { Contract, ImplementedTrait } from './contract';
import { ContractBuilder } from './contract';
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
  c.addImplementedTrait(permitTrait);
  c.addEip712();

  c.addUseClause('stylus_sdk::alloy_primitives', 'B256');

  // if (pausable) {
  //   c.addFunctionCodeBefore(erc20PermitTrait, functions.permit, ['self.pausable.when_not_paused()?;']);
  // }
}

function addBurnable(c: ContractBuilder) {
  c.addImplementedTrait(burnableTrait);

  // if (pausable) {
  //   c.addFunctionCodeBefore(erc20Trait, functions.burn, ['self.pausable.when_not_paused()?;']);
  //   c.addFunctionCodeBefore(erc20Trait, functions.burn_from, ['self.pausable.when_not_paused()?;']);
  // }
}

function addFlashMint(c: ContractBuilder) {
  c.addImplementedTrait(flashMintTrait);

  c.addUseClause('stylus_sdk::abi', 'Bytes');

  // if (pausable) {
  //   c.addFunctionCodeBefore(flashMintTrait, functions.flash_loan, ['self.pausable.when_not_paused()?;']);
  // }
}

const erc20Trait: ImplementedTrait = {
  interface: {
    name: 'IErc20',
    associatedError: true,
  },
  implementation: {
    storageName: 'erc20',
    type: 'Erc20',
  },
  modulePath: 'openzeppelin_stylus::token::erc20',
  functions: [
    {
      name: 'total_supply',
      args: [getSelfArg('immutable')],
      returns: 'U256',
      code: `self.erc20.total_supply()`,
    },
    {
      name: 'balance_of',
      args: [getSelfArg('immutable'), { name: 'account', type: 'Address' }],
      returns: 'U256',
      code: `self.erc20.balance_of(account)`,
    },
    {
      name: 'transfer',
      args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'value', type: 'U256' }],
      returns: { ok: 'bool', err: 'Self::Error' },
      code: `self.erc20.transfer(to, value)?`,
    },
    {
      name: 'allowance',
      args: [getSelfArg('immutable'), { name: 'owner', type: 'Address' }, { name: 'spender', type: 'Address' }],
      returns: 'U256',
      code: `self.erc20.allowance(owner, spender)`,
    },
    {
      name: 'approve',
      args: [getSelfArg(), { name: 'spender', type: 'Address' }, { name: 'value', type: 'U256' }],
      returns: { ok: 'bool', err: 'Self::Error' },
      code: `self.erc20.approve(spender, value)?`,
    },
    {
      name: 'transfer_from',
      args: [
        getSelfArg(),
        { name: 'from', type: 'Address' },
        { name: 'to', type: 'Address' },
        { name: 'value', type: 'U256' },
      ],
      returns: { ok: 'bool', err: 'Self::Error' },
      code: `self.erc20.transfer_from(from, to, value)?`,
    },
  ],
};

const noncesTrait: ImplementedTrait = {
  interface: {
    name: 'INonces',
  },
  implementation: {
    storageName: 'nonces',
    type: 'Nonces',
  },
  modulePath: 'openzeppelin_stylus::utils::nonces',
  functions: [
    {
      name: 'nonces',
      args: [getSelfArg('immutable'), { name: 'owner', type: 'Address' }],
      code: 'self.nonces.nonces(owner)',
      returns: 'U256'
    }
  ]
};

const permitTrait: ImplementedTrait = {
  interface: {
    name: 'IErc20Permit',
    associatedError: true,
  },
  implementation: {
    storageName: 'erc20_permit',
    type: 'Erc20Permit',
    genericType: 'Eip712',
  },
  modulePath: 'openzeppelin_stylus::token::erc20::extensions',
  functions: [
    {
      name: 'domain_separator',
      attribute: 'selector(name = "DOMAIN_SEPARATOR")',
      args: [getSelfArg('immutable')],
      returns: 'B256',
      code: `self.erc20_permit.domain_separator()`,
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
      returns: { ok: '()', err: 'Self::Error' },
      code: `self.erc20_permit.permit(owner, spender, value, deadline, v, r, s, &mut self.${erc20Trait.implementation!.storageName}, &mut self.${noncesTrait.implementation!.storageName})?`,
    }
  ],
};

const burnableTrait: ImplementedTrait = {
  interface: {
    name: 'IErc20Burnable',
    associatedError: true,
  },
  modulePath: 'openzeppelin_stylus::token::erc20::extensions',
  functions: [
      {
        name: 'burn',
        args: [getSelfArg(), { name: 'value', type: 'U256' }],
        returns: { ok: '()', err: 'Self::Error' },
        code: `self.${erc20Trait.implementation!.storageName}.burn(value)?`,
      },
      {
        name: 'burn_from',
        args: [getSelfArg(), { name: 'account', type: 'Address' }, { name: 'value', type: 'U256' }],
        returns: { ok: '()', err: 'Self::Error' },
        code: `self.${erc20Trait.implementation!.storageName}.burn_from(account, value)?`,
      },
  ],
};

const flashMintTrait: ImplementedTrait = {
  interface: {
    name: 'IErc3156FlashLender',
    associatedError: true,
  },
  implementation: {
    storageName: 'flash_mint',
    type: 'Erc20FlashMint',
  },
  modulePath: 'openzeppelin_stylus::token::erc20::extensions',
  functions: [
    {
      name: 'max_flash_loan',
      args: [getSelfArg('immutable'), { name: 'token', type: 'Address' }],
      returns: 'U256',
      code: `self.flash_mint.max_flash_loan(token, &self.${erc20Trait.implementation!.storageName})`,
    },
    {
      name: 'flash_fee',
      args: [getSelfArg('immutable'), { name: 'token', type: 'Address' }, { name: 'value', type: 'U256' }],
      returns: { ok: 'U256', err: 'Self::Error' },
      code: `self.flash_mint.flash_fee(token, value)?`,
    },
    {
      name: 'flash_loan',
      args: [
        getSelfArg(),
        { name: 'receiver', type: 'Address' },
        { name: 'token', type: 'Address' },
        { name: 'value', type: 'U256' },
        { name: 'data', type: 'Bytes' },
      ],
      returns: { ok: 'bool', err: 'Self::Error' },
      code: `self.flash_mint.flash_loan(receiver, token, value, &data, &mut self.${erc20Trait.implementation!.storageName})?`,
    },
  ]
};

// const erc20MetadataTrait: ImplementedTrait = {
//   name: 'Erc20Metadata',
//   interface: 'IErc20Metadata',
//   storage: {
//     name: 'metadata',
//     type: 'Erc20Metadata',
//   }
//   modulePath: 'openzeppelin_stylus::token::erc20::extensions',
// }
