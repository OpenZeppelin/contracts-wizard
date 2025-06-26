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

  // if (pausable) {
  //   c.addFunctionCodeBefore(erc20Trait, functions.transfer, ['self.pausable.when_not_paused()?;']);
  //   c.addFunctionCodeBefore(erc20Trait, functions.transfer_from, ['self.pausable.when_not_paused()?;']);
  // }
}

function addPermit(c: ContractBuilder) {
  c.addImplementedTrait(noncesTrait);
  c.addImplementedTrait(permitTrait);
  c.addEip712();

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

  // if (pausable) {
  //   c.addFunctionCodeBefore(flashMintTrait, functions.flash_loan, ['self.pausable.when_not_paused()?;']);
  // }
}

const ERC20_STORAGE_NAME = 'erc20';
const NONCES_STORAGE_NAME = 'nonces';
const PERMIT_STORAGE_NAME = 'erc20_permit';
const FLASH_MINT_STORAGE_NAME = 'flash_mint';

const erc20Trait: ImplementedTrait = {
  interface: {
    name: 'IErc20',
    associatedError: true,
  },
  errors: [
    { variant: 'InsufficientBalance', value: 'ERC20InsufficientBalance' },
    { variant: 'InvalidSender', value: 'ERC20InvalidSender' },
    { variant: 'InvalidReceiver', value: 'ERC20InvalidReceiver' },
    { variant: 'InsufficientAllowance', value: 'ERC20InsufficientAllowance' },
    { variant: 'InvalidSpender', value: 'ERC20InvalidSpender' },
    { variant: 'InvalidApprover', value: 'ERC20InvalidApprover' },
  ],
  storage: {
    name: ERC20_STORAGE_NAME,
    type: 'Erc20',
  },
  modulePath: 'openzeppelin_stylus::token::erc20',
  requiredImports: [
    { containerPath: 'alloc::vec', name: 'Vec' },
    { containerPath: 'stylus_sdk::alloy_primitives', name: 'Address' },
    { containerPath: 'stylus_sdk::alloy_primitives', name: 'U256' },
  ],
  functions: [
    {
      name: 'total_supply',
      args: [getSelfArg('immutable')],
      returns: 'U256',
      code: `self.${ERC20_STORAGE_NAME}.total_supply()`,
    },
    {
      name: 'balance_of',
      args: [getSelfArg('immutable'), { name: 'account', type: 'Address' }],
      returns: 'U256',
      code: `self.${ERC20_STORAGE_NAME}.balance_of(account)`,
    },
    {
      name: 'transfer',
      args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'value', type: 'U256' }],
      returns: { ok: 'bool', err: 'Self::Error' },
      code: `self.${ERC20_STORAGE_NAME}.transfer(to, value)?`,
    },
    {
      name: 'allowance',
      args: [getSelfArg('immutable'), { name: 'owner', type: 'Address' }, { name: 'spender', type: 'Address' }],
      returns: 'U256',
      code: `self.${ERC20_STORAGE_NAME}.allowance(owner, spender)`,
    },
    {
      name: 'approve',
      args: [getSelfArg(), { name: 'spender', type: 'Address' }, { name: 'value', type: 'U256' }],
      returns: { ok: 'bool', err: 'Self::Error' },
      code: `self.${ERC20_STORAGE_NAME}.approve(spender, value)?`,
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
      code: `self.${ERC20_STORAGE_NAME}.transfer_from(from, to, value)?`,
    },
  ],
};

const noncesTrait: ImplementedTrait = {
  interface: {
    name: 'INonces',
  },
  storage: {
    name: NONCES_STORAGE_NAME,
    type: 'Nonces',
  },
  modulePath: 'openzeppelin_stylus::utils::nonces',
  functions: [
    {
      name: 'nonces',
      args: [getSelfArg('immutable'), { name: 'owner', type: 'Address' }],
      code: `self.${NONCES_STORAGE_NAME}.nonces(owner)`,
      returns: 'U256'
    }
  ]
};

const permitTrait: ImplementedTrait = {
  interface: {
    name: 'IErc20Permit',
    associatedError: true,
  },
  errors: {
    list: [
      { variant: 'ExpiredSignature', value: 'ERC2612ExpiredSignature' },
      { variant: 'InvalidSigner', value: 'ERC2612InvalidSigner' },
      { variant: 'InsufficientBalance', value: 'erc20::ERC20InsufficientBalance' },
      { variant: 'InvalidSender', value: 'erc20::ERC20InvalidSender' },
      { variant: 'InvalidReceiver', value: 'erc20::ERC20InvalidReceiver' },
      { variant: 'InsufficientAllowance', value: 'erc20::ERC20InsufficientAllowance' },
      { variant: 'InvalidSpender', value: 'erc20::ERC20InvalidSpender' },
      { variant: 'InvalidApprover', value: 'erc20::ERC20InvalidApprover' },
      { variant: 'InvalidSignature', value: 'ecdsa::ECDSAInvalidSignature' },
      { variant: 'InvalidSignatureS', value: 'ecdsa::ECDSAInvalidSignatureS' },
    ],
    wraps: erc20Trait.interface,
  },
  storage: {
    name: PERMIT_STORAGE_NAME,
    type: 'Erc20Permit',
    genericType: 'Eip712',
  },
  modulePath: 'openzeppelin_stylus::token::erc20::extensions',
  requiredImports: [{ containerPath: 'stylus_sdk::alloy_primitives', name: 'B256' }],
  functions: [
    {
      name: 'domain_separator',
      attribute: 'selector(name = "DOMAIN_SEPARATOR")',
      args: [getSelfArg('immutable')],
      returns: 'B256',
      code: `self.${PERMIT_STORAGE_NAME}.domain_separator()`,
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
      code: `self.${PERMIT_STORAGE_NAME}.permit(owner, spender, value, deadline, v, r, s, &mut self.${ERC20_STORAGE_NAME}, &mut self.${NONCES_STORAGE_NAME})?`,
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
      code: `self.${ERC20_STORAGE_NAME}.burn(value)?`,
    },
    {
      name: 'burn_from',
      args: [getSelfArg(), { name: 'account', type: 'Address' }, { name: 'value', type: 'U256' }],
      returns: { ok: '()', err: 'Self::Error' },
      code: `self.${ERC20_STORAGE_NAME}.burn_from(account, value)?`,
    },
  ],
};

const flashMintTrait: ImplementedTrait = {
  interface: {
    name: 'IErc3156FlashLender',
    associatedError: true,
  },
  errors: {
    list: [
      { variant: 'UnsupportedToken', value: 'ERC3156UnsupportedToken' },
      { variant: 'ExceededMaxLoan', value: 'ERC3156ExceededMaxLoan' },
      { variant: 'ERC3156InvalidReceiver', value: 'ERC3156InvalidReceiver' },
      { variant: 'InsufficientBalance', value: 'erc20::ERC20InsufficientBalance' },
      { variant: 'InvalidSender', value: 'erc20::ERC20InvalidSender' },
      { variant: 'InvalidReceiver', value: 'erc20::ERC20InvalidReceiver' },
      { variant: 'InsufficientAllowance', value: 'erc20::ERC20InsufficientAllowance' },
      { variant: 'InvalidSpender', value: 'erc20::ERC20InvalidSpender' },
      { variant: 'InvalidApprover', value: 'erc20::ERC20InvalidApprover' },
    ],
    wraps: erc20Trait.interface,
  },
  storage: {
    name: FLASH_MINT_STORAGE_NAME,
    type: 'Erc20FlashMint',
  },
  modulePath: 'openzeppelin_stylus::token::erc20::extensions',
  requiredImports: [{ containerPath: 'stylus_sdk::abi', name: 'Bytes' }],
  functions: [
    {
      name: 'max_flash_loan',
      args: [getSelfArg('immutable'), { name: 'token', type: 'Address' }],
      returns: 'U256',
      code: `self.${FLASH_MINT_STORAGE_NAME}.max_flash_loan(token, &self.${ERC20_STORAGE_NAME})`,
    },
    {
      name: 'flash_fee',
      args: [getSelfArg('immutable'), { name: 'token', type: 'Address' }, { name: 'value', type: 'U256' }],
      returns: { ok: 'U256', err: 'Self::Error' },
      code: `self.${FLASH_MINT_STORAGE_NAME}.flash_fee(token, value)?`,
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
      code: `self.${FLASH_MINT_STORAGE_NAME}.flash_loan(receiver, token, value, &data, &mut self.${ERC20_STORAGE_NAME})?`,
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
