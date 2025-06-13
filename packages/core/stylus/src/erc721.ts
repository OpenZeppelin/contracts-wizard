import type { BaseImplementedTrait, Contract } from './contract';
import { ContractBuilder } from './contract';
import { defineFunctions } from './utils/define-functions';
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

  c.addUseClause('alloc::vec', 'Vec');
  c.addUseClause('stylus_sdk::alloy_primitives', 'Address');
  c.addUseClause('stylus_sdk::alloy_primitives', 'U256');
  c.addUseClause('stylus_sdk::alloy_primitives', 'FixedBytes');
  
  c.addFunctionCodeAfter(erc165Trait.functions[0]!, ['  || <Self as IErc721>::interface_id() == interface_id'], erc165Trait)

  // if (pausable) {
  //   // Add transfer functions with pause checks

  //   c.addFunctionCodeBefore(erc721Trait, functions.transfer_from, ['self.pausable.when_not_paused()?;']);
  // }
}

function addBurnable(c: ContractBuilder, enumerable: boolean) {
  c.addUseClause('openzeppelin_stylus::token::erc721::extensions', 'IErc721Burnable');

  c.addUseClause('alloc::vec', 'Vec');
  c.addUseClause('stylus_sdk::alloy_primitives', 'U256');

  c.addFunction(erc721Trait, functions.burn);

  // if (pausable) {
  //   c.addFunctionCodeBefore(erc721Trait, functions.burn, ['self.pausable.when_not_paused()?;']);
  // }

  if (enumerable) {
    c.setFunctionCode(erc721Trait, functions.burn, [
      `let owner = self.${erc721Trait.implementation.storageName}.owner_of(token_id)?;`,
      `self.${erc721Trait.implementation.storageName}.burn(token_id)?;`,
      `self.${enumerableTrait.implementation.storageName}._remove_token_from_owner_enumeration(owner, token_id, &self.${erc721Trait.implementation.storageName})?;`,
      `self.${enumerableTrait.implementation.storageName}._remove_token_from_all_tokens_enumeration(token_id);`,
      'Ok(())',
    ]);
  }
}

function addEnumerable(c: ContractBuilder) {
  c.addImplementedTrait(enumerableTrait);

  c.addUseClause('alloc::vec', 'Vec');
  c.addUseClause('alloy_primitives', 'Address');
  c.addUseClause('alloy_primitives', 'U256');
  c.addUseClause('stylus_sdk', 'abi::Bytes');

  c.addFunctionCodeAfter(erc721Trait, functions.supports_interface, [
    indentLine(`|| ${enumerableTrait.implementation.type}::supports_interface(interface_id)`, 1),
  ]);

  for (const fn of [functions.transfer_from, functions.safe_transfer_from, functions.safe_transfer_from_with_data]) {
    c.addFunctionCodeBefore(erc721Trait, fn, [
      `let previous_owner = self.${erc721Trait.implementation.storageName}.owner_of(token_id)?;`,
    ]);
    c.addFunctionCodeAfter(erc721Trait, fn, [
      `self.${enumerableTrait.implementation.storageName}._remove_token_from_owner_enumeration(previous_owner, token_id, &self.${erc721Trait.implementation.storageName})?;`,
      `self.${enumerableTrait.implementation.storageName}._add_token_to_owner_enumeration(to, token_id, &self.${erc721Trait.implementation.storageName})?;`,
      'Ok(())',
    ]);
  }
}

const erc721Trait: BaseImplementedTrait = {
  interface: {
    name: 'IErc721',
    associatedError: true,
  },
  implementation: {
    storageName: 'erc721',
    type: 'Erc721',
  },
  modulePath: 'openzeppelin_stylus::token::erc721',
  functions: [
    {
      name: 'balance_of',
      args: [
        getSelfArg('immutable'),
        { name: 'owner', type: 'Address' },
      ],
      returns: { ok: 'U256', err: 'Self::Error' },
      code: [`self.erc721.balance_of(owner)?`],
    },
    {
      name: 'owner_of',
      args: [
        getSelfArg('immutable'),
        { name: 'token_id', type: 'U256' },
      ],
      returns: { ok: 'Address', err: 'Self::Error' },
      code: [`self.erc721.owner_of(token_id)?`],
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
      code: [`self.erc721.safe_transfer_from(from, to, token_id)?`],
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
      code: [`self.erc721.safe_transfer_from_with_data(from, to, token_id, data)?`],
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
      code: [`self.erc721.transfer_from(from, to, token_id)?`],
    },
    {
      name: 'approve',
      args: [
        getSelfArg(),
        { name: 'to', type: 'Address' },
        { name: 'token_id', type: 'U256' },
      ],
      returns: { ok: '()', err: 'Self::Error' },
      code: [`self.erc721.approve(to, token_id)?`],
    },
    {
      name: 'set_approval_for_all',
      args: [
        getSelfArg(),
        { name: 'operator', type: 'Address' },
        { name: 'approved', type: 'bool' },
      ],
      returns: { ok: '()', err: 'Self::Error' },
      code: [`self.erc721.set_approval_for_all(operator, approved)?`],
    },
    {
      name: 'get_approved',
      args: [
        getSelfArg('immutable'),
        { name: 'token_id', type: 'U256' },
      ],
      returns: { ok: 'Address', err: 'Self::Error' },
      code: [`self.erc721.get_approved(token_id)?`],
    },
    {
      name: 'is_approved_for_all',
      args: [
        getSelfArg('immutable'),
        { name: 'owner', type: 'Address' },
        { name: 'operator', type: 'Address' },
      ],
      returns: 'bool',
      code: [`self.erc721.is_approved_for_all(owner, operator)`],
    },
  ],
};

const erc165Trait: BaseImplementedTrait = {
  interface: {
    name: 'IErc165',
  },
  modulePath: 'openzeppelin_stylus::utils::introspection::erc165',
  functions: [
    {
      name: 'supports_interface',
      args: [{ name: 'interface_id', type: 'FixedBytes<4>' }],
      returns: 'bool',
      code: ['<Self as IErc165>::interface_id() == interface_id'],
    },
  ],
};

const enumerableTrait: BaseImplementedTrait = {
  name: 'Erc721Enumerable',
  implementation: {
    storageName: 'enumerable',
    type: 'Erc721Enumerable',
  },
  modulePath: 'openzeppelin_stylus::token::erc721::extensions',
};

// const erc721MetadataTrait: BaseImplementedTrait = {
//   name: 'Erc721Metadata',
//   storage: {
//     name: 'metadata',
//     type: 'Erc721Metadata',
//   }
//   modulePath: 'openzeppelin_stylus::token::erc721::extensions',
// }

const functions = defineFunctions({

  // Overrides

  // Extensions
  burn: {
    args: [getSelfArg(), { name: 'token_id', type: 'U256' }],
    returns: 'Result<(), Vec<u8>>',
    code: [`self.${erc721Trait.implementation.storageName}.burn(token_id).map_err(|e| e.into())`],
  },
});
