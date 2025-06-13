import type { BaseImplementedTrait, Contract, ContractFunction } from './contract';
import { ContractBuilder } from './contract';
import { defineFunctions } from './utils/define-functions';
import type { CommonContractOptions } from './common-options';
import { withCommonContractDefaults, getSelfArg } from './common-options';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { setAccessControl } from './set-access-control';
import { setInfo } from './set-info';

export interface ERC1155Options extends CommonContractOptions {
  name: string;
  burnable?: boolean;
  // pausable?: boolean;
  supply?: boolean;
}

export const defaults: Required<ERC1155Options> = {
  name: 'MyToken',
  burnable: false,
  // pausable: false,
  supply: false,
  access: commonDefaults.access,
  info: commonDefaults.info,
} as const;

export function printERC1155(opts: ERC1155Options = defaults): string {
  return printContract(buildERC1155(opts));
}

function withDefaults(opts: ERC1155Options): Required<ERC1155Options> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    // pausable: opts.pausable ?? defaults.pausable,
    supply: opts.supply ?? defaults.supply,
  };
}

export function isAccessControlRequired(_opts: Partial<ERC1155Options>): boolean {
  // return opts.pausable === true;
  return false;
}

export function buildERC1155(opts: ERC1155Options): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  // Erc1155Supply reexports Erc1155 functionality
  const baseTrait = allOpts.supply ? erc1155SupplyTrait : erc1155Trait;

  addBase(c, baseTrait);

  if (allOpts.supply) {
    addSupply(c, baseTrait);
  }

  // c.addImplementedTrait(erc1155MetadataTrait);

  // if (allOpts.pausable) {
  //   addPausable(c, allOpts.access);
  // }

  if (allOpts.burnable) {
    addBurnable(c, baseTrait);
  }

  setAccessControl(c, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

function addBase(c: ContractBuilder, baseTrait: BaseImplementedTrait) {
  c.addImplementedTrait(baseTrait);
  c.addImplementedTrait(getIErc165Trait(baseTrait.implementation!.storageName));

  c.addUseClause('alloc::vec', 'Vec');
  c.addUseClause('stylus_sdk::alloy_primitives', 'Address');
  c.addUseClause('stylus_sdk::alloy_primitives', 'U256');
  c.addUseClause('stylus_sdk::alloy_primitives', 'FixedBytes');

  // if (pausable) {
  // Add transfer functions with pause checks
  // c.addUseClause('alloc::vec', 'Vec');
  // c.addUseClause('alloy_primitives', 'Address');
  // c.addUseClause('alloy_primitives', 'U256');

  // c.addFunctionCodeBefore(baseTrait, functions(baseTrait).safe_transfer_from, ['self.pausable.when_not_paused()?;']);
  // c.addFunctionCodeBefore(baseTrait, functions(baseTrait).safe_batch_transfer_from, ['self.pausable.when_not_paused()?;']);
  // }
}

// This adds supply-related parts without re-adding the contract structure,
// as it was already added in `addBase`.
function addSupply(c: ContractBuilder, baseTrait: BaseImplementedTrait) {
  if (baseTrait !== erc1155SupplyTrait) {
    throw new Error('Base trait must be of type `Erc1155Supply`');
  }

  c.addUseClause('openzeppelin_stylus::token::erc1155::extensions', 'IErc1155Supply');
  c.addUseClause('alloy_primitives', 'U256');

  const fns = functions(baseTrait);
  c.addFunction(baseTrait, fns.total_supply);
  c.addFunction(baseTrait, fns.total_supply_all);
  c.addFunction(baseTrait, fns.exists);

  // if (pausable) {
  //   // Add pausable checks to appropriate functions
  // }
}

function addBurnable(c: ContractBuilder, trait: BaseImplementedTrait) {
  c.addUseClause('openzeppelin_stylus::token::erc1155::extensions', 'IErc1155Burnable');

  c.addUseClause('alloc::vec', 'Vec');
  c.addUseClause('alloy_primitives', 'Address');
  c.addUseClause('alloy_primitives', 'U256');

  const fns = functions(trait);

  c.addFunction(trait, fns.burn);
  c.addFunction(trait, fns.burn_batch);

  // if (pausable) {
  //   c.addFunctionCodeBefore(trait, fns.burn, ['self.pausable.when_not_paused()?;']);
  //   c.addFunctionCodeBefore(trait, fns.burn_batch, ['self.pausable.when_not_paused()?;']);
  // }
}

function getErc1155FunctionsWithStorageName(storageName: string): ContractFunction[] {
  return [
    {
      name: 'balance_of',
      args: [
        getSelfArg('immutable'),
        { name: 'account', type: 'Address' },
        { name: 'id', type: 'U256' },
      ],
      returns: 'U256',
      code: [`self.${storageName}.balance_of(account, id)`],
    },
    {
      name: 'balance_of_batch',
      args: [
        getSelfArg('immutable'),
        { name: 'accounts', type: 'Vec<Address>' },
        { name: 'ids', type: 'Vec<U256>' },
      ],
      returns: { ok: 'Vec<U256>', err: 'Self::Error' },
      code: [`self.${storageName}.balance_of_batch(accounts, ids)?`],
    },
    {
      name: 'set_approval_for_all',
      args: [
        getSelfArg(),
        { name: 'operator', type: 'Address' },
        { name: 'approved', type: 'bool' },
      ],
      returns: { ok: '()', err: 'Self::Error' },
      code: [`self.${storageName}.set_approval_for_all(operator, ids)?`],
    },
    {
      name: 'is_approved_for_all',
      args: [
        getSelfArg('immutable'),
        { name: 'account', type: 'Address' },
        { name: 'operator', type: 'Address' },
      ],
      returns: 'bool',
      code: [`self.${storageName}.is_approved_for_all(account, operator)`],
    },
    {
      name: 'safe_transfer_from',
      args: [
        getSelfArg(),
        { name: 'from', type: 'Address' },
        { name: 'to', type: 'Address' },
        { name: 'id', type: 'U256' },
        { name: 'value', type: 'U256' },
        { name: 'data', type: 'Bytes' },
      ],
      returns: { ok: '()', err: 'Self::Error' },
      code: [`self.${storageName}.safe_transfer_from(from, to, id, value, data)?`],
    },
    {
      name: 'safe_batch_transfer_from',
      args: [
        getSelfArg(),
        { name: 'from', type: 'Address' },
        { name: 'to', type: 'Address' },
        { name: 'ids', type: 'Vec<U256>' },
        { name: 'values', type: 'Vec<U256>' },
        { name: 'data', type: 'Bytes' },
      ],
      returns: { ok: '()', err: 'Self::Error' },
      code: [`self.${storageName}.safe_batch_transfer_from(from, to, ids, values, data)?`],
    },
  ]
}

const erc1155Trait: BaseImplementedTrait = {
  interface: {
    name: 'IErc1155',
    associatedError: true,
  },
  implementation: {
    storageName: 'erc1155',
    type: 'Erc1155',
  },
  modulePath: 'openzeppelin_stylus::token::erc1155',
  // we don't know which storage name will be used with these functions,
  // so we set them during runtime (see `getErc1155FunctionsWithStorageName`).
  functions: [],
};

function getIErc165Trait(storageName: string): BaseImplementedTrait {
  return {
    interface: {
      name: 'IErc165',
    },
    modulePath: 'openzeppelin_stylus::utils::introspection::erc165',
    functions: [
      {
        name: 'supports_interface',
        args: [{ name: 'interface_id', type: 'FixedBytes<4>' }],
        returns: 'bool',
        code: [`self.${storageName}.supports_interface(interface_id)`],
      },
    ],
  };
}

const erc1155SupplyTrait: BaseImplementedTrait = {
  name: 'Erc1155Supply',
  implementation: {
    storageName: 'erc1155_supply',
    type: 'Erc1155Supply',
  },
  modulePath: 'openzeppelin_stylus::token::erc1155::extensions',
};

// const erc1155MetadataTrait: BaseImplementedTrait = {
//   name: 'Erc1155Metadata',
//   storage: {
//     name: 'metadata',
//     type: 'Erc1155Metadata',
//   }
//   modulePath: 'openzeppelin_stylus::token::erc1155::extensions',
// }

const functions = (trait: BaseImplementedTrait) =>
  defineFunctions({
    // Token Functions


    // Extensions
    burn: {
      args: [
        getSelfArg(),
        { name: 'account', type: 'Address' },
        { name: 'token_id', type: 'U256' },
        { name: 'value', type: 'U256' },
      ],
      returns: 'Result<(), Vec<u8>>',
      code: [`self.${trait.implementation.storageName}.burn(account, token_id, value).map_err(|e| e.into())`],
    },
    burn_batch: {
      args: [
        getSelfArg(),
        { name: 'account', type: 'Address' },
        { name: 'token_ids', type: 'Vec<U256>' },
        { name: 'values', type: 'Vec<U256>' },
      ],
      returns: 'Result<(), Vec<u8>>',
      code: [`self.${trait.implementation.storageName}.burn_batch(account, token_ids, values).map_err(|e| e.into())`],
    },

    total_supply: {
      args: [getSelfArg('immutable'), { name: 'id', type: 'U256' }],
      returns: 'U256',
      code: [`self.${trait.implementation.storageName}.total_supply(id)`],
    },
    total_supply_all: {
      attribute: 'selector(name = "totalSupply")',
      args: [getSelfArg('immutable')],
      returns: 'U256',
      code: [`self.${trait.implementation.storageName}.total_supply_all()`],
    },
    exists: {
      args: [getSelfArg('immutable'), { name: 'id', type: 'U256' }],
      returns: 'bool',
      code: [`self.${trait.implementation.storageName}.exists(id)`],
    },
  });
