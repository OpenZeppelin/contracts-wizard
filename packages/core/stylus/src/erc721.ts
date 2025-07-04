import type { Contract, ContractTrait, StoredContractTrait } from './contract';
import { ContractBuilder } from './contract';
import type { CommonContractOptions } from './common-options';
import { withCommonContractDefaults, getSelfArg } from './common-options';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { setAccessControl } from './set-access-control';
import { setInfo } from './set-info';
import { indentLine } from './utils/format-lines';
import { defineFunctions } from './utils/define-functions';

export interface ERC721Options extends CommonContractOptions {
  name: string;
  burnable?: boolean;
  enumerable?: boolean;
  // pausable?: boolean;
}

export const defaults: Required<ERC721Options> = {
  name: 'MyToken',
  burnable: false,
  enumerable: false,
  // pausable: false,
  access: commonDefaults.access,
  info: commonDefaults.info,
} as const;

export function printERC721(opts: ERC721Options = defaults): string {
  return printContract(buildERC721(opts));
}

function withDefaults(opts: ERC721Options): Required<ERC721Options> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    enumerable: opts.enumerable ?? defaults.enumerable,
    // pausable: opts.pausable ?? defaults.pausable,
  };
}

export function isAccessControlRequired(_opts: Partial<ERC721Options>): boolean {
  // return opts.pausable === true;
  return false;
}

export function buildERC721(opts: ERC721Options): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  addBase(c);

  // if (allOpts.pausable) {
  //   addPausable(c, allOpts.access);
  // }

  if (allOpts.burnable) {
    addBurnable(c, allOpts.enumerable);
  }

  if (allOpts.enumerable) {
    addEnumerable(c);
  }

  setAccessControl(c, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

function addBase(c: ContractBuilder) {
  c.addImplementedTrait(erc721Trait);
  c.addImplementedTrait(erc165Trait);
  // c.addImplementedTrait(erc721MetadataTrait);

  // if (pausable) {
  //   // Add transfer functions with pause checks

  //   c.addFunctionCodeBefore(erc721Trait, functions.transfer_from, ['self.pausable.when_not_paused()?;']);
  // }
}

function addBurnable(c: ContractBuilder, enumerable: boolean) {
  c.addImplementedTrait(burnableTrait);

  // if (pausable) {
  //   c.addFunctionCodeBefore(erc721Trait, functions.burn, ['self.pausable.when_not_paused()?;']);
  // }

  if (enumerable) {
    c.addFunctionCodeBefore(
      functions.burnable.burn,
      [`let owner = self.${erc721Trait.storage.name}.owner_of(token_id)?;`],
      burnableTrait,
    );
    c.addFunctionCodeAfter(
      functions.burnable.burn,
      [
        `self.${enumerableTrait.storage.name}._remove_token_from_owner_enumeration(owner, token_id, &self.${erc721Trait.storage.name})?;`,
        `self.${enumerableTrait.storage.name}._remove_token_from_all_tokens_enumeration(token_id);`,
        'Ok(())',
      ],
      burnableTrait,
    );
  }
}

function addEnumerable(c: ContractBuilder) {
  c.addImplementedTrait(enumerableTrait);

  c.addFunctionCodeAfter(
    functions.erc165.supports_interface,
    [indentLine(`|| self.${enumerableTrait.storage.name}.supports_interface(interface_id)`, 1)],
    erc165Trait,
  );

  // safe_transfer_from, safe_transfer_from_with_data, transfer_from
  for (const fn of [
    functions.erc721.safe_transfer_from,
    functions.erc721.safe_transfer_from_with_data,
    functions.erc721.transfer_from,
  ]) {
    c.addFunctionCodeBefore(
      fn,
      [`let previous_owner = self.${erc721Trait.storage.name}.owner_of(token_id)?;`],
      erc721Trait,
    );
    c.addFunctionCodeAfter(
      fn,
      [
        `self.${enumerableTrait.storage.name}._remove_token_from_owner_enumeration(previous_owner, token_id, &self.${erc721Trait.storage.name})?;`,
        `self.${enumerableTrait.storage.name}._add_token_to_owner_enumeration(to, token_id, &self.${erc721Trait.storage.name})?;`,
        'Ok(())',
      ],
      erc721Trait,
    );
  }
}

const ERC721_STORAGE_NAME = 'erc721';
const ENUMERABLE_STORAGE_NAME = 'enumerable';

const functions = {
  erc721: defineFunctions({
    balance_of: {
      name: 'balance_of',
      args: [getSelfArg('immutable'), { name: 'owner', type: 'Address' }],
      returns: { ok: 'U256', err: 'Self::Error' },
      code: `self.${ERC721_STORAGE_NAME}.balance_of(owner)?`,
    },
    owner_of: {
      name: 'owner_of',
      args: [getSelfArg('immutable'), { name: 'token_id', type: 'U256' }],
      returns: { ok: 'Address', err: 'Self::Error' },
      code: `self.${ERC721_STORAGE_NAME}.owner_of(token_id)?`,
    },
    safe_transfer_from: {
      name: 'safe_transfer_from',
      args: [
        getSelfArg(),
        { name: 'from', type: 'Address' },
        { name: 'to', type: 'Address' },
        { name: 'token_id', type: 'U256' },
      ],
      returns: { ok: '()', err: 'Self::Error' },
      code: `self.${ERC721_STORAGE_NAME}.safe_transfer_from(from, to, token_id)?`,
    },
    safe_transfer_from_with_data: {
      attribute: 'selector(name = "safeTransferFrom")',
      name: 'safe_transfer_from_with_data',
      args: [
        getSelfArg(),
        { name: 'from', type: 'Address' },
        { name: 'to', type: 'Address' },
        { name: 'token_id', type: 'U256' },
        { name: 'data', type: 'Bytes' },
      ],
      returns: { ok: '()', err: 'Self::Error' },
      code: `self.${ERC721_STORAGE_NAME}.safe_transfer_from_with_data(from, to, token_id, data)?`,
    },
    transfer_from: {
      name: 'transfer_from',
      args: [
        getSelfArg(),
        { name: 'from', type: 'Address' },
        { name: 'to', type: 'Address' },
        { name: 'token_id', type: 'U256' },
      ],
      returns: { ok: '()', err: 'Self::Error' },
      code: `self.${ERC721_STORAGE_NAME}.transfer_from(from, to, token_id)?`,
    },
    approve: {
      name: 'approve',
      args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'token_id', type: 'U256' }],
      returns: { ok: '()', err: 'Self::Error' },
      code: `self.${ERC721_STORAGE_NAME}.approve(to, token_id)?`,
    },
    set_approval_for_all: {
      name: 'set_approval_for_all',
      args: [getSelfArg(), { name: 'operator', type: 'Address' }, { name: 'approved', type: 'bool' }],
      returns: { ok: '()', err: 'Self::Error' },
      code: `self.${ERC721_STORAGE_NAME}.set_approval_for_all(operator, approved)?`,
    },
    get_approved: {
      name: 'get_approved',
      args: [getSelfArg('immutable'), { name: 'token_id', type: 'U256' }],
      returns: { ok: 'Address', err: 'Self::Error' },
      code: `self.${ERC721_STORAGE_NAME}.get_approved(token_id)?`,
    },
    is_approved_for_all: {
      name: 'is_approved_for_all',
      args: [getSelfArg('immutable'), { name: 'owner', type: 'Address' }, { name: 'operator', type: 'Address' }],
      returns: 'bool',
      code: `self.${ERC721_STORAGE_NAME}.is_approved_for_all(owner, operator)`,
    },
  }),
  erc165: defineFunctions({
    supports_interface: {
      name: 'supports_interface',
      args: [getSelfArg('immutable'), { name: 'interface_id', type: 'FixedBytes<4>' }],
      returns: 'bool',
      code: `self.${ERC721_STORAGE_NAME}.supports_interface(interface_id)`,
    },
  }),
  burnable: defineFunctions({
    burn: {
      name: 'burn',
      args: [getSelfArg(), { name: 'token_id', type: 'U256' }],
      returns: { ok: '()', err: 'Self::Error' },
      code: `self.${ERC721_STORAGE_NAME}.burn(token_id)?`,
    },
  }),
  enumerable: defineFunctions({
    token_of_owner_by_index: {
      name: 'token_of_owner_by_index',
      args: [getSelfArg('immutable'), { name: 'owner', type: 'Address' }, { name: 'index', type: 'U256' }],
      returns: { ok: 'U256', err: 'Self::Error' },
      code: `self.${ENUMERABLE_STORAGE_NAME}.token_of_owner_by_index(owner, index)?`,
    },
    total_supply: {
      name: 'total_supply',
      args: [getSelfArg('immutable')],
      returns: 'U256',
      code: `self.${ENUMERABLE_STORAGE_NAME}.total_supply()`,
    },
    token_by_index: {
      name: 'token_by_index',
      args: [getSelfArg('immutable'), { name: 'index', type: 'U256' }],
      returns: { ok: 'U256', err: 'Self::Error' },
      code: `self.${ENUMERABLE_STORAGE_NAME}.token_by_index(index)?`,
    },
  }),
};

const erc721Trait: StoredContractTrait = {
  name: 'IErc721',
  associatedError: true,
  errors: [
    { variant: 'InvalidOwner', value: { module: 'erc721', error: 'ERC721InvalidOwner' } },
    { variant: 'NonexistentToken', value: { module: 'erc721', error: 'ERC721NonexistentToken' } },
    { variant: 'IncorrectOwner', value: { module: 'erc721', error: 'ERC721IncorrectOwner' } },
    { variant: 'InvalidSender', value: { module: 'erc721', error: 'ERC721InvalidSender' } },
    { variant: 'InvalidReceiver', value: { module: 'erc721', error: 'ERC721InvalidReceiver' } },
    { variant: 'InvalidReceiverWithReason', value: { module: 'erc721', error: 'InvalidReceiverWithReason' } },
    { variant: 'InsufficientApproval', value: { module: 'erc721', error: 'ERC721InsufficientApproval' } },
    { variant: 'InvalidApprover', value: { module: 'erc721', error: 'ERC721InvalidApprover' } },
    { variant: 'InvalidOperator', value: { module: 'erc721', error: 'ERC721InvalidOperator' } },
  ],
  storage: {
    name: ERC721_STORAGE_NAME,
    type: 'Erc721',
  },
  modulePath: 'openzeppelin_stylus::token::erc721',
  priority: 1,
  requiredImports: [
    { containerPath: 'alloc::vec', name: 'Vec' },
    { containerPath: 'stylus_sdk::abi', name: 'Bytes' },
    { containerPath: 'stylus_sdk::alloy_primitives', name: 'Address' },
    { containerPath: 'stylus_sdk::alloy_primitives', name: 'U256' },
  ],
  functions: Object.values(functions.erc721),
};

const erc165Trait: ContractTrait = {
  name: 'IErc165',
  modulePath: 'openzeppelin_stylus::utils::introspection::erc165',
  priority: 4,
  requiredImports: [{ containerPath: 'stylus_sdk::alloy_primitives', name: 'FixedBytes' }],
  functions: Object.values(functions.erc165),
};

const burnableTrait: ContractTrait = {
  name: 'IErc721Burnable',
  associatedError: true,
  modulePath: 'openzeppelin_stylus::token::erc721::extensions::burnable',
  priority: 3,
  functions: Object.values(functions.burnable),
};

const enumerableTrait: StoredContractTrait = {
  name: 'IErc721Enumerable',
  associatedError: true,
  errors: [
    { variant: 'OutOfBoundsIndex', value: { module: 'enumerable', error: 'ERC721OutOfBoundsIndex' } },
    {
      variant: 'EnumerableForbiddenBatchMint',
      value: { module: 'enumerable', error: 'ERC721EnumerableForbiddenBatchMint' },
    },
  ],
  storage: {
    name: ENUMERABLE_STORAGE_NAME,
    type: 'Erc721Enumerable',
  },
  modulePath: 'openzeppelin_stylus::token::erc721::extensions::enumerable',
  priority: 2,
  functions: Object.values(functions.enumerable),
};
