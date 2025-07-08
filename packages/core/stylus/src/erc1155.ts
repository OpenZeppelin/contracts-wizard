import type { Contract, ContractTrait, StoredContractTrait } from './contract';
import { ContractBuilder } from './contract';
import type { CommonContractOptions } from './common-options';
import { withCommonContractDefaults, getSelfArg } from './common-options';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { setAccessControl } from './set-access-control';
import { setInfo } from './set-info';
import { defineFunctions } from './utils/define-functions';

const ERC1155_SUPPLY_STORAGE_NAME = 'erc1155_supply';
const ERC1155_STORAGE_NAME = 'erc1155';

type StorageName = typeof ERC1155_SUPPLY_STORAGE_NAME | typeof ERC1155_STORAGE_NAME;

export interface ERC1155Options extends CommonContractOptions {
  name: string;
  burnable?: boolean;
  supply?: boolean;
}

export const defaults: Required<ERC1155Options> = {
  name: 'MyToken',
  burnable: false,
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

  // Erc1155Supply reexports Erc1155 functionality, so it's used as inherited storage
  const storageName = allOpts.supply ? ERC1155_SUPPLY_STORAGE_NAME : ERC1155_STORAGE_NAME;

  addBase(c, storageName);

  if (allOpts.supply) {
    addSupply(c);
  }

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
}

function addSupply(c: ContractBuilder) {
  c.addImplementedTrait(erc1155SupplyTrait);
}

function addBurnable(c: ContractBuilder, storageName: StorageName) {
  c.addImplementedTrait(getIErc1155BurnableTrait(storageName));
}

const functions = {
  erc1155: (storageName: StorageName) =>
    defineFunctions({
      balance_of: {
        name: 'balance_of',
        args: [getSelfArg('immutable'), { name: 'account', type: 'Address' }, { name: 'id', type: 'U256' }],
        returns: 'U256',
        code: `self.${storageName}.balance_of(account, id)`,
      },
      balance_of_batch: {
        name: 'balance_of_batch',
        args: [getSelfArg('immutable'), { name: 'accounts', type: 'Vec<Address>' }, { name: 'ids', type: 'Vec<U256>' }],
        returns: { ok: 'Vec<U256>', err: 'Self::Error' },
        code: `self.${storageName}.balance_of_batch(accounts, ids)?`,
      },
      set_approval_for_all: {
        name: 'set_approval_for_all',
        args: [getSelfArg(), { name: 'operator', type: 'Address' }, { name: 'approved', type: 'bool' }],
        returns: { ok: '()', err: 'Self::Error' },
        code: `self.${storageName}.set_approval_for_all(operator, approved)?`,
      },
      is_approved_for_all: {
        name: 'is_approved_for_all',
        args: [getSelfArg('immutable'), { name: 'account', type: 'Address' }, { name: 'operator', type: 'Address' }],
        returns: 'bool',
        code: `self.${storageName}.is_approved_for_all(account, operator)`,
      },
      safe_transfer_from: {
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
      safe_batch_transfer_from: {
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
    }),
  erc165: (storageName: StorageName) =>
    defineFunctions({
      supports_interface: {
        name: 'supports_interface',
        args: [getSelfArg('immutable'), { name: 'interface_id', type: 'FixedBytes<4>' }],
        returns: 'bool',
        code: `self.${storageName}.supports_interface(interface_id)`,
      },
    }),
  burnable: (storageName: StorageName) =>
    defineFunctions({
      burn: {
        name: 'burn',
        args: [
          getSelfArg(),
          { name: 'account', type: 'Address' },
          { name: 'token_id', type: 'U256' },
          { name: 'value', type: 'U256' },
        ],
        returns: { ok: '()', err: 'Self::Error' },
        code:
          storageName === 'erc1155'
            ? `self.${storageName}.burn(account, token_id, value)?`
            : `self.${storageName}._burn(account, token_id, value)?`,
      },
      burn_batch: {
        name: 'burn_batch',
        args: [
          getSelfArg(),
          { name: 'account', type: 'Address' },
          { name: 'token_ids', type: 'Vec<U256>' },
          { name: 'values', type: 'Vec<U256>' },
        ],
        returns: { ok: '()', err: 'Self::Error' },
        code:
          storageName === 'erc1155'
            ? `self.${storageName}.burn_batch(account, token_ids, values)?`
            : `self.${storageName}._burn_batch(account, token_ids, values)?`,
      },
    }),
  erc1155Supply: defineFunctions({
    total_supply: {
      name: 'total_supply',
      args: [getSelfArg('immutable'), { name: 'id', type: 'U256' }],
      returns: 'U256',
      code: `self.${ERC1155_SUPPLY_STORAGE_NAME}.total_supply(id)`,
    },
    total_supply_all: {
      name: 'total_supply_all',
      attribute: 'selector(name = "totalSupply")',
      args: [getSelfArg('immutable')],
      returns: 'U256',
      code: `self.${ERC1155_SUPPLY_STORAGE_NAME}.total_supply_all()`,
    },
    exists: {
      name: 'exists',
      args: [getSelfArg('immutable'), { name: 'id', type: 'U256' }],
      returns: 'bool',
      code: `self.${ERC1155_SUPPLY_STORAGE_NAME}.exists(id)`,
    },
  }),
};

function getErc1155WithStorageName(storageName: StorageName): ContractTrait {
  const erc1155: ContractTrait = {
    name: 'IErc1155',
    associatedError: true,
    errors: [
      { variant: 'InsufficientBalance', value: { module: 'erc1155', error: 'ERC1155InsufficientBalance' } },
      { variant: 'InvalidSender', value: { module: 'erc1155', error: 'ERC1155InvalidSender' } },
      { variant: 'InvalidReceiver', value: { module: 'erc1155', error: 'ERC1155InvalidReceiver' } },
      { variant: 'InvalidReceiverWithReason', value: { module: 'erc1155', error: 'InvalidReceiverWithReason' } },
      { variant: 'MissingApprovalForAll', value: { module: 'erc1155', error: 'ERC1155MissingApprovalForAll' } },
      { variant: 'InvalidApprover', value: { module: 'erc1155', error: 'ERC1155InvalidApprover' } },
      { variant: 'InvalidOperator', value: { module: 'erc1155', error: 'ERC1155InvalidOperator' } },
      { variant: 'InvalidArrayLength', value: { module: 'erc1155', error: 'ERC1155InvalidArrayLength' } },
    ],
    modulePath: 'openzeppelin_stylus::token::erc1155',
    requiredImports: [
      { containerPath: 'alloc::vec', name: 'Vec' },
      { containerPath: 'stylus_sdk::abi', name: 'Bytes' },
      { containerPath: 'stylus_sdk::alloy_primitives', name: 'Address' },
      { containerPath: 'stylus_sdk::alloy_primitives', name: 'U256' },
    ],
    functions: Object.values(functions.erc1155(storageName)),
  };
  // if `Erc1155Supply` is used as storage, then storage will be set by the supply trait
  return storageName === 'erc1155'
    ? <StoredContractTrait>{ ...erc1155, storage: { name: 'erc1155', type: 'Erc1155' } }
    : erc1155;
}

function getIErc165Trait(storageName: StorageName): ContractTrait {
  return {
    name: 'IErc165',
    modulePath: 'openzeppelin_stylus::utils::introspection::erc165',
    requiredImports: [{ containerPath: 'stylus_sdk::alloy_primitives', name: 'FixedBytes' }],
    functions: Object.values(functions.erc165(storageName)),
  };
}

function getIErc1155BurnableTrait(storageName: StorageName): ContractTrait {
  return {
    name: 'IErc1155Burnable',
    associatedError: true,
    modulePath: 'openzeppelin_stylus::token::erc1155::extensions',
    functions: Object.values(functions.burnable(storageName)),
  };
}

const erc1155SupplyTrait: StoredContractTrait = {
  name: 'IErc1155Supply',
  storage: {
    name: ERC1155_SUPPLY_STORAGE_NAME,
    type: 'Erc1155Supply',
  },
  modulePath: 'openzeppelin_stylus::token::erc1155::extensions',
  functions: Object.values(functions.erc1155Supply),
};
