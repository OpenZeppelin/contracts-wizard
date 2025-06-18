import type { Contract, ImplementedTrait } from './contract';
import { ContractBuilder } from './contract';
import type { CommonContractOptions } from './common-options';
import { withCommonContractDefaults, getSelfArg } from './common-options';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { setAccessControl } from './set-access-control';
import { setInfo } from './set-info';

const ERC1155_SUPPLY_STORAGE_NAME = 'erc1155_supply';
const ERC1155_STORAGE_NAME = 'erc1155';

type StorageName = typeof ERC1155_SUPPLY_STORAGE_NAME | typeof ERC1155_STORAGE_NAME;

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
  const storageName = allOpts.supply ? ERC1155_SUPPLY_STORAGE_NAME : ERC1155_STORAGE_NAME;

  addBase(c, storageName);

  if (allOpts.supply) {
    addSupply(c);
  }

  // c.addImplementedTrait(erc1155MetadataTrait);

  // if (allOpts.pausable) {
  //   addPausable(c, allOpts.access);
  // }

  if (allOpts.burnable) {
    addBurnable(c, storageName);
  }

  setAccessControl(c, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

function addBase(c: ContractBuilder, storageName: StorageName) {
  c.addImplementedTrait(getErc1155WithStorageName(storageName));
  c.addImplementedTrait(getIErc165Trait(storageName));

  // if (pausable) {
  // c.addFunctionCodeBefore(baseTrait, functions(baseTrait).safe_transfer_from, ['self.pausable.when_not_paused()?;']);
  // c.addFunctionCodeBefore(baseTrait, functions(baseTrait).safe_batch_transfer_from, ['self.pausable.when_not_paused()?;']);
  // }
}

// This adds supply-related parts without re-adding the contract structure,
// as it was already added in `addBase`.
function addSupply(c: ContractBuilder) {
  c.addImplementedTrait(erc1155SupplyTrait);

  // if (pausable) {
  //   // Add pausable checks to appropriate functions
  // }
}

function addBurnable(c: ContractBuilder, storageName: StorageName) {
  c.addImplementedTrait(getIErc1155BurnableTrait(storageName));

  // if (pausable) {
  //   c.addFunctionCodeBefore(trait, fns.burn, ['self.pausable.when_not_paused()?;']);
  //   c.addFunctionCodeBefore(trait, fns.burn_batch, ['self.pausable.when_not_paused()?;']);
  // }
}

function getErc1155WithStorageName(storageName: StorageName): ImplementedTrait {
  let erc1155: ImplementedTrait = {
    interface: 'IErc1155',
    hasError: true,
    modulePath: 'openzeppelin_stylus::token::erc1155',
    requiredImports: [
      { containerPath: 'alloc::vec', name: 'Vec' },
      { containerPath: 'stylus_sdk::abi', name: 'Bytes' },
      { containerPath: 'stylus_sdk::alloy_primitives', name: 'Address' },
      { containerPath: 'stylus_sdk::alloy_primitives', name: 'U256' },
    ],
    functions: [
      {
        name: 'balance_of',
        args: [
          getSelfArg('immutable'),
          { name: 'account', type: 'Address' },
          { name: 'id', type: 'U256' },
        ],
        returns: 'U256',
        code: `self.${storageName}.balance_of(account, id)`,
      },
      {
        name: 'balance_of_batch',
        args: [
          getSelfArg('immutable'),
          { name: 'accounts', type: 'Vec<Address>' },
          { name: 'ids', type: 'Vec<U256>' },
        ],
        returns: { ok: 'Vec<U256>', err: 'Self::Error' },
        code: `self.${storageName}.balance_of_batch(accounts, ids)?`,
      },
      {
        name: 'set_approval_for_all',
        args: [
          getSelfArg(),
          { name: 'operator', type: 'Address' },
          { name: 'approved', type: 'bool' },
        ],
        returns: { ok: '()', err: 'Self::Error' },
        code: `self.${storageName}.set_approval_for_all(operator, approved)?`,
      },
      {
        name: 'is_approved_for_all',
        args: [
          getSelfArg('immutable'),
          { name: 'account', type: 'Address' },
          { name: 'operator', type: 'Address' },
        ],
        returns: 'bool',
        code: `self.${storageName}.is_approved_for_all(account, operator)`,
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
        code: `self.${storageName}.safe_transfer_from(from, to, id, value, data)?`,
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
        code: `self.${storageName}.safe_batch_transfer_from(from, to, ids, values, data)?`,
      },
    ],
  };
  // if `Erc1155Supply` is used as storage, then this can be omitted
  if (storageName === "erc1155") {
    erc1155.storage = {
      name: 'erc1155',
      type: 'Erc1155',
    };
  }
  return erc1155;
}

function getIErc165Trait(storageName: StorageName): ImplementedTrait {
  return {
    interface: 'IErc165',
    modulePath: 'openzeppelin_stylus::utils::introspection::erc165',
    requiredImports: [{ containerPath: 'stylus_sdk::alloy_primitives', name: 'FixedBytes' }],
    functions: [
      {
        name: 'supports_interface',
        args: [getSelfArg('immutable'), { name: 'interface_id', type: 'FixedBytes<4>' }],
        returns: 'bool',
        code: `self.${storageName}.supports_interface(interface_id)`,
      },
    ],
  };
}

function getIErc1155BurnableTrait(storageName: StorageName): ImplementedTrait {
  return {
    interface: 'IErc1155Burnable',
    hasError: true,
    modulePath: 'openzeppelin_stylus::token::erc1155::extensions',
    functions: [
      {
        name: 'burn',
        args: [
          getSelfArg(),
          { name: 'account', type: 'Address' },
          { name: 'token_id', type: 'U256' },
          { name: 'value', type: 'U256' },
        ],
        returns: { ok: '()', err: 'Self::Error' },
        code: storageName === 'erc1155' 
          ? `self.${storageName}.burn(account, token_id, value)?`
          : `self.${storageName}._burn(account, token_id, value)?`,
      },
      {
        name: 'burn_batch',
        args: [
          getSelfArg(),
          { name: 'account', type: 'Address' },
          { name: 'token_ids', type: 'Vec<U256>' },
          { name: 'values', type: 'Vec<U256>' },
        ],
        returns: { ok: '()', err: 'Self::Error' },
        code: storageName === 'erc1155' 
          ? `self.${storageName}.burn_batch(account, token_ids, values)?`
          : `self.${storageName}._burn_batch(account, token_ids, values)?`,
      },
    ],
  };
}

const erc1155SupplyTrait: ImplementedTrait = {
  interface: 'IErc1155Supply',
  storage: {
    name: ERC1155_SUPPLY_STORAGE_NAME,
    type: 'Erc1155Supply',
  },
  modulePath: 'openzeppelin_stylus::token::erc1155::extensions',
  functions: [
    {
      name: 'total_supply',
      args: [getSelfArg('immutable'), { name: 'id', type: 'U256' }],
      returns: 'U256',
      code: `self.${ERC1155_SUPPLY_STORAGE_NAME}.total_supply(id)`,
    },
    {
      name: 'total_supply_all',
      attribute: 'selector(name = "totalSupply")',
      args: [getSelfArg('immutable')],
      returns: 'U256',
      code: `self.${ERC1155_SUPPLY_STORAGE_NAME}.total_supply_all()`,
    },
    {
      name: 'exists',
      args: [getSelfArg('immutable'), { name: 'id', type: 'U256' }],
      returns: 'bool',
      code: `self.${ERC1155_SUPPLY_STORAGE_NAME}.exists(id)`,
    },
  ],
};

// const erc1155MetadataTrait: ImplementedTrait = {
//   name: 'Erc1155Metadata',
//   storage: {
//     name: 'metadata',
//     type: 'Erc1155Metadata',
//   }
//   modulePath: 'openzeppelin_stylus::token::erc1155::extensions',
// }
