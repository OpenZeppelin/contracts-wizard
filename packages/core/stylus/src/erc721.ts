import type { Contract, ContractTrait, StoredContractTrait } from './contract';
import { ContractBuilder } from './contract';
import type { CommonContractOptions } from './common-options';
import { withCommonContractDefaults, getSelfArg } from './common-options';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { setAccessControl } from './set-access-control';
import { setInfo } from './set-info';
import { indentLine } from './utils/format-lines';

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
      burnableTrait.functions[0]!,
      [`let owner = self.${erc721Trait.storage!.name}.owner_of(token_id)?;`],
      burnableTrait,
    );
    c.addFunctionCodeAfter(
      burnableTrait.functions[0]!,
      [
        `self.${enumerableTrait.storage!.name}._remove_token_from_owner_enumeration(owner, token_id, &self.${erc721Trait.storage!.name})?;`,
        `self.${enumerableTrait.storage!.name}._remove_token_from_all_tokens_enumeration(token_id);`,
        'Ok(())',
      ],
      burnableTrait,
    );
  }
}

function addEnumerable(c: ContractBuilder) {
  c.addImplementedTrait(enumerableTrait);

  c.addFunctionCodeAfter(
    erc165Trait.functions[0]!,
    [indentLine(`|| self.${enumerableTrait.storage!.name}.supports_interface(interface_id)`, 1)],
    erc165Trait,
  );

  // safe_transfer_from, safe_transfer_from_with_data, transfer_from
  for (const fn of [erc721Trait.functions[2]!, erc721Trait.functions[3]!, erc721Trait.functions[4]!]) {
    c.addFunctionCodeBefore(
      fn,
      [`let previous_owner = self.${erc721Trait.storage!.name}.owner_of(token_id)?;`],
      erc721Trait,
    );
    c.addFunctionCodeAfter(
      fn,
      [
        `self.${enumerableTrait.storage!.name}._remove_token_from_owner_enumeration(previous_owner, token_id, &self.${erc721Trait.storage!.name})?;`,
        `self.${enumerableTrait.storage!.name}._add_token_to_owner_enumeration(to, token_id, &self.${erc721Trait.storage!.name})?;`,
        'Ok(())',
      ],
      erc721Trait,
    );
  }
}

const ERC721_STORAGE_NAME = 'erc721';
const ENUMERABLE_STORAGE_NAME = 'enumerable';

const erc721Trait: StoredContractTrait = {
  name: 'IErc721',
  errors: [
    { variant: 'InvalidOwner', associated: 'ERC721InvalidOwner' },
    { variant: 'NonexistentToken', associated: 'ERC721NonexistentToken' },
    { variant: 'IncorrectOwner', associated: 'ERC721IncorrectOwner' },
    { variant: 'InvalidSender', associated: 'ERC721InvalidSender' },
    { variant: 'InvalidReceiver', associated: 'ERC721InvalidReceiver' },
    { variant: 'InvalidReceiverWithReason', associated: 'InvalidReceiverWithReason' },
    { variant: 'InsufficientApproval', associated: 'ERC721InsufficientApproval' },
    { variant: 'InvalidApprover', associated: 'ERC721InvalidApprover' },
    { variant: 'InvalidOperator', associated: 'ERC721InvalidOperator' },
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
  functions: [
    {
      name: 'balance_of',
      args: [getSelfArg('immutable'), { name: 'owner', type: 'Address' }],
      returns: { ok: 'U256', err: 'Self::Error' },
      code: `self.${ERC721_STORAGE_NAME}.balance_of(owner)?`,
    },
    {
      name: 'owner_of',
      args: [getSelfArg('immutable'), { name: 'token_id', type: 'U256' }],
      returns: { ok: 'Address', err: 'Self::Error' },
      code: `self.${ERC721_STORAGE_NAME}.owner_of(token_id)?`,
    },
    {
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
    {
      name: 'safe_transfer_from_with_data',
      attribute: 'selector(name = "safeTransferFrom")',
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
    {
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
    {
      name: 'approve',
      args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'token_id', type: 'U256' }],
      returns: { ok: '()', err: 'Self::Error' },
      code: `self.${ERC721_STORAGE_NAME}.approve(to, token_id)?`,
    },
    {
      name: 'set_approval_for_all',
      args: [getSelfArg(), { name: 'operator', type: 'Address' }, { name: 'approved', type: 'bool' }],
      returns: { ok: '()', err: 'Self::Error' },
      code: `self.${ERC721_STORAGE_NAME}.set_approval_for_all(operator, approved)?`,
    },
    {
      name: 'get_approved',
      args: [getSelfArg('immutable'), { name: 'token_id', type: 'U256' }],
      returns: { ok: 'Address', err: 'Self::Error' },
      code: `self.${ERC721_STORAGE_NAME}.get_approved(token_id)?`,
    },
    {
      name: 'is_approved_for_all',
      args: [getSelfArg('immutable'), { name: 'owner', type: 'Address' }, { name: 'operator', type: 'Address' }],
      returns: 'bool',
      code: `self.${ERC721_STORAGE_NAME}.is_approved_for_all(owner, operator)`,
    },
  ],
};

const erc165Trait: ContractTrait = {
  name: 'IErc165',
  modulePath: 'openzeppelin_stylus::utils::introspection::erc165',
  priority: 4,
  requiredImports: [{ containerPath: 'stylus_sdk::alloy_primitives', name: 'FixedBytes' }],
  functions: [
    {
      name: 'supports_interface',
      args: [getSelfArg('immutable'), { name: 'interface_id', type: 'FixedBytes<4>' }],
      returns: 'bool',
      code: `self.${ERC721_STORAGE_NAME}.supports_interface(interface_id)`,
    },
  ],
};

const burnableTrait: ContractTrait = {
  name: 'IErc721Burnable',
  errors: [],
  modulePath: 'openzeppelin_stylus::token::erc721::extensions',
  priority: 3,
  functions: [
    {
      name: 'burn',
      args: [getSelfArg(), { name: 'token_id', type: 'U256' }],
      returns: { ok: '()', err: 'Self::Error' },
      code: `self.${ERC721_STORAGE_NAME}.burn(token_id)?`,
    },
  ],
};

const enumerableTrait: StoredContractTrait = {
  name: 'IErc721Enumerable',
  errors: [
    { variant: 'OutOfBoundsIndex', associated: 'ERC721OutOfBoundsIndex' },
    { variant: 'EnumerableForbiddenBatchMint', associated: 'ERC721EnumerableForbiddenBatchMint' },
  ],
  storage: {
    name: ENUMERABLE_STORAGE_NAME,
    type: 'Erc721Enumerable',
  },
  modulePath: 'openzeppelin_stylus::token::erc721::extensions',
  priority: 2,
  functions: [
    {
      name: 'token_of_owner_by_index',
      args: [getSelfArg('immutable'), { name: 'owner', type: 'Address' }, { name: 'index', type: 'U256' }],
      returns: { ok: 'U256', err: 'Self::Error' },
      code: `self.${ENUMERABLE_STORAGE_NAME}.token_of_owner_by_index(owner, index)?`,
    },
    {
      name: 'total_supply',
      args: [getSelfArg('immutable')],
      returns: 'U256',
      code: `self.${ENUMERABLE_STORAGE_NAME}.total_supply()`,
    },
    {
      name: 'token_by_index',
      args: [getSelfArg('immutable'), { name: 'index', type: 'U256' }],
      returns: { ok: 'U256', err: 'Self::Error' },
      code: `self.${ENUMERABLE_STORAGE_NAME}.token_by_index(index)?`,
    },
  ],
};

// const erc721MetadataTrait: ImplementedTrait = {
//   name: 'Erc721Metadata',
//   storage: {
//     name: 'metadata',
//     type: 'Erc721Metadata',
//   }
//   modulePath: 'openzeppelin_stylus::token::erc721::extensions',
// }
