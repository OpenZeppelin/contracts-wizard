import { BaseImplementedTrait, Contract, ContractBuilder } from './contract';
import { addPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import {
  CommonContractOptions,
  withCommonContractDefaults,
  getSelfArg,
} from './common-options';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { setAccessControl } from './set-access-control';
import { setInfo } from './set-info';

export interface ERC20Options extends CommonContractOptions {
  name: string;
  burnable?: boolean;
  pausable?: boolean;
  permit?: boolean;
  flashmint?: boolean;
}

export const defaults: Required<ERC20Options> = {
  name: 'MyToken',
  burnable: false,
  pausable: false,
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
    pausable: opts.pausable ?? defaults.pausable,
    permit: opts.permit ?? defaults.permit,
    flashmint: opts.flashmint ?? defaults.flashmint,
  };
}

export function isAccessControlRequired(opts: Required<ERC20Options>): boolean {
  return opts.pausable;
}

export function buildERC20(opts: ERC20Options): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  // Erc20Permit overrides Erc20 functionality
  const trait = allOpts.permit
    ? addPermit(c, allOpts.pausable)
    : addBase(c, allOpts.pausable);

  addMetadata(c);

  if (allOpts.pausable) {
    addPausable(c, allOpts.access);
  }

  if (allOpts.burnable) {
    addBurnable(c, allOpts.pausable, trait);
  }

  if (allOpts.flashmint) {
    addFlashMint(c, allOpts.pausable, trait);
  }

  setAccessControl(c, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

function addBase(c: ContractBuilder, pausable: boolean): BaseImplementedTrait {
  // Add the base traits
  c.addUseClause('openzeppelin_stylus::token::erc20', 'Erc20');
  c.addUseClause('openzeppelin_stylus::token::erc20', 'IErc20');
  c.addImplementedTrait(erc20Trait);

  if (pausable) {
    // Add transfer functions with pause checks
    c.addUseClause('alloc::vec', 'Vec');
    c.addUseClause('alloy_primitives', 'Address');
    c.addUseClause('alloy_primitives', 'U256');

    c.addFunctionCodeBefore(erc20Trait, functions(erc20Trait).transfer, [
      'self.pausable.when_not_paused()?;',
    ]);
    c.addFunctionCodeBefore(erc20Trait, functions(erc20Trait).transfer_from, [
      'self.pausable.when_not_paused()?;',
    ]);
  }

  return erc20Trait;
}

function addPermit(c: ContractBuilder, pausable: boolean): BaseImplementedTrait {
  c.addUseClause('openzeppelin_stylus::token::erc20::extensions', 'Erc20Permit');
  c.addUseClause('openzeppelin_stylus::token::erc20', 'IErc20');
  c.addUseClause('openzeppelin_stylus::utils::cryptography::eip712', 'IEip712');

  c.addImplementedTrait(erc20PermitTrait);
  c.addEip712('ERC-20 Permit Example', '1');

  if (pausable) {
    // Add transfer & permit functions with pause checks
    c.addUseClause('alloc::vec', 'Vec');
    c.addUseClause('alloy_primitives', 'Address');
    c.addUseClause('alloy_primitives', 'U256');
    c.addUseClause('alloy_primitives', 'B256');

    c.addFunctionCodeBefore(
      erc20PermitTrait,
      functions(erc20PermitTrait).permit,
      ['self.pausable.when_not_paused()?;']
    );
    c.addFunctionCodeBefore(
      erc20PermitTrait,
      functions(erc20PermitTrait).transfer,
      ['self.pausable.when_not_paused()?;']
    );
    c.addFunctionCodeBefore(
      erc20PermitTrait,
      functions(erc20PermitTrait).transfer_from,
      ['self.pausable.when_not_paused()?;']
    );
  }

  return erc20PermitTrait;
}

function addMetadata(c: ContractBuilder) {
  // c.addUseClause('openzeppelin_stylus::token::erc20::extensions', 'Erc20Metadata');
  // c.addImplementedTrait(erc20MetadataTrait);
}

function addBurnable(c: ContractBuilder, pausable: boolean, trait: BaseImplementedTrait) {
  c.addUseClause('openzeppelin_stylus::token::erc20::extensions', 'IErc20Burnable');

  c.addUseClause('alloc::vec', 'Vec');
  c.addUseClause('alloy_primitives', 'Address');
  c.addUseClause('alloy_primitives', 'U256');

  c.addFunction(trait, functions(trait).burn);
  c.addFunction(trait, functions(trait).burn_from);

  if (pausable) {
    c.addFunctionCodeBefore(trait, functions(trait).burn, [
      'self.pausable.when_not_paused()?;',
    ]);
    c.addFunctionCodeBefore(trait, functions(trait).burn_from, [
      'self.pausable.when_not_paused()?;',
    ]);
  }
}

function addFlashMint(c: ContractBuilder, pausable: boolean, baseTrait: BaseImplementedTrait) {
  c.addUseClause(
    'openzeppelin_stylus::token::erc20::extensions',
    'Erc20FlashMint'
  );
  c.addUseClause(
    'openzeppelin_stylus::token::erc20::extensions',
    'IErc3156FlashLender'
  );

  c.addUseClause('stylus_sdk::abi', 'Bytes');

  c.addImplementedTrait(flashMintTrait);
  
  const fns = functions(flashMintTrait, baseTrait);
  c.addFunction(flashMintTrait, fns.max_flash_loan);
  c.addFunction(flashMintTrait, fns.flash_fee);
  c.addFunction(flashMintTrait, fns.flash_loan);
  
  if (pausable) {
    c.addFunctionCodeBefore(flashMintTrait, fns.flash_loan, [
      'self.pausable.when_not_paused()?;',
    ]);
  }
}

const erc20Trait: BaseImplementedTrait = {
  name: 'Erc20',
  storage: {
    name: 'erc20',
    type: 'Erc20',
  },
};

const erc20PermitTrait: BaseImplementedTrait = {
  name: 'Erc20Permit<Eip712>',
  storage: {
    name: 'erc20_permit',
    type: 'Erc20Permit<Eip712>',
  },
};

const flashMintTrait: BaseImplementedTrait = {
  name: 'Erc20FlashMint',
  storage: {
    name: 'flash_mint',
    type: 'Erc20FlashMint',
  },
  omit_inherit: true
};

// const erc20MetadataTrait: BaseImplementedTrait = {
//   name: 'Erc20Metadata',
//   storage: {
//     name: 'metadata',
//     type: 'Erc20Metadata',
//   }
// }

const functions = (trait: BaseImplementedTrait, base?: BaseImplementedTrait) =>
  defineFunctions({
    // Token Functions
    transfer: {
      args: [
        getSelfArg(),
        { name: 'to', type: 'Address' },
        { name: 'value', type: 'U256' },
      ],
      returns: 'Result<bool, Vec<u8>>',
      code: [
        `self.${trait.storage.name}.transfer(to, value).map_err(|e| e.into())`,
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
        `self.${trait.storage.name}.transfer_from(from, to, value).map_err(|e| e.into())`,
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
      code: [`self.${trait.storage.name}.burn(value).map_err(|e| e.into())`],
    },
    burn_from: {
      args: [
        getSelfArg(),
        { name: 'account', type: 'Address' },
        { name: 'value', type: 'U256' },
      ],
      returns: 'Result<(), Vec<u8>>',
      code: [
        `self.${trait.storage.name}.burn_from(account, value).map_err(|e| e.into())`,
      ],
    },

    permit: {
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
        `self.${trait.storage.name}.permit(owner, spender, value, deadline, v, r, s).map_err(|e| e.into())`,
      ],
    },

    max_flash_loan: {
      args: [
        getSelfArg("immutable"),
        { name: 'token', type: 'Address' },
      ],
      returns: 'U256',
      code: [
        `self.${trait.storage.name}.max_flash_loan(token, &self.${base!.storage.name}).map_err(|e| e.into())`,
      ],
    },
    flash_fee: {
      args: [
        getSelfArg("immutable"),
        { name: 'token', type: 'Address' },
        { name: 'value', type: 'U256' },
      ],
      returns: 'U256',
      code: [
        `self.${trait.storage.name}.flash_fee(token, value).map_err(|e| e.into())`,
      ],
    },
    flash_loan: {
      args: [
        getSelfArg(),
        { name: 'receiver', type: 'Address' },
        { name: 'token', type: 'Address' },
        { name: 'value', type: 'U256' },
        { name: 'data', type: 'Bytes' },
      ],
      returns: 'Result<(), Vec<u8>>',
      code: [
        `self.${trait.storage.name}.flash_loan(receiver, token, value, data, &mut self.${base!.storage.name}).map_err(|e| e.into())`,
      ],
    },
  });
