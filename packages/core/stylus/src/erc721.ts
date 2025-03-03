import type { BaseImplementedTrait, Contract } from './contract';
import { ContractBuilder } from './contract';
import { addPausable } from './add-pausable';
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
  pausable?: boolean;
}

export const defaults: Required<ERC721Options> = {
  name: 'MyToken',
  burnable: false,
  enumerable: false,
  pausable: false,
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
    pausable: opts.pausable ?? defaults.pausable,
  };
}

export function isAccessControlRequired(opts: Partial<ERC721Options>): boolean {
  return opts.pausable === true;
}

export function buildERC721(opts: ERC721Options): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  addBase(c, allOpts.pausable);

  if (allOpts.pausable) {
    addPausable(c, allOpts.access);
  }

  if (allOpts.burnable) {
    addBurnable(c, allOpts.pausable, allOpts.enumerable);
  }

  if (allOpts.enumerable) {
    addEnumerable(c, allOpts.pausable);
  }

  setAccessControl(c, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

function addBase(c: ContractBuilder, pausable: boolean) {
  c.addImplementedTrait(erc721Trait);
  // c.addImplementedTrait(erc721MetadataTrait);

  // the trait necessary to access Erc721 functions within custom functions of the child contract
  c.addUseClause('openzeppelin_stylus::token::erc721', 'IErc721');

  // Call nested IErc65 from Erc721
  c.addUseClause('openzeppelin_stylus::utils', 'introspection::erc165::IErc165');
  c.addUseClause('alloy_primitives', 'FixedBytes');
  c.addFunction(erc721Trait, functions.supports_interface);

  if (pausable) {
    // Add transfer functions with pause checks
    c.addUseClause('alloc::vec', 'Vec');
    c.addUseClause('alloy_primitives', 'Address');
    c.addUseClause('alloy_primitives', 'U256');

    c.addFunctionCodeBefore(erc721Trait, functions.transfer_from, ['self.pausable.when_not_paused()?;']);
  }
}

function addBurnable(c: ContractBuilder, pausable: boolean, enumerable: boolean) {
  c.addUseClause('openzeppelin_stylus::token::erc721::extensions', 'IErc721Burnable');

  c.addUseClause('alloc::vec', 'Vec');
  c.addUseClause('alloy_primitives', 'U256');

  c.addFunction(erc721Trait, functions.burn);

  if (pausable) {
    c.addFunctionCodeBefore(erc721Trait, functions.burn, ['self.pausable.when_not_paused()?;']);
  }
  if (enumerable) {
    c.setFunctionCode(erc721Trait, functions.burn, [
      `let owner = self.${erc721Trait.storage.name}.owner_of(token_id)?;`,
      `self.${erc721Trait.storage.name}.burn(token_id)?;`,
      `self.${enumerableTrait.storage.name}._remove_token_from_owner_enumeration(owner, token_id, &self.${erc721Trait.storage.name})?;`,
      `self.${enumerableTrait.storage.name}._remove_token_from_all_tokens_enumeration(token_id);`,
      'Ok(())',
    ]);
  }
}

function addEnumerable(c: ContractBuilder, _pausable: boolean) {
  c.addImplementedTrait(enumerableTrait);

  c.addUseClause('alloc::vec', 'Vec');
  c.addUseClause('alloy_primitives', 'Address');
  c.addUseClause('alloy_primitives', 'U256');
  c.addUseClause('stylus_sdk::abi', 'Bytes');

  c.addFunctionCodeAfter(erc721Trait, functions.supports_interface, [
    indentLine(`|| ${enumerableTrait.storage.type}::supports_interface(interface_id)`, 1),
  ]);

  for (const fn of [functions.transfer_from, functions.safe_transfer_from, functions.safe_transfer_from_with_data]) {
    c.addFunctionCodeBefore(erc721Trait, fn, [
      `let previous_owner = self.${erc721Trait.storage.name}.owner_of(token_id)?;`,
    ]);
    c.addFunctionCodeAfter(erc721Trait, fn, [
      `self.${enumerableTrait.storage.name}._remove_token_from_owner_enumeration(previous_owner, token_id, &self.${erc721Trait.storage.name})?;`,
      `self.${enumerableTrait.storage.name}._add_token_to_owner_enumeration(to, token_id, &self.${erc721Trait.storage.name})?;`,
      'Ok(())',
    ]);
  }
}

const erc721Trait: BaseImplementedTrait = {
  name: 'Erc721',
  storage: {
    name: 'erc721',
    type: 'Erc721',
  },
  modulePath: 'openzeppelin_stylus::token::erc721',
};

const enumerableTrait: BaseImplementedTrait = {
  name: 'Erc721Enumerable',
  storage: {
    name: 'enumerable',
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
  // Token Functions
  transfer_from: {
    args: [
      getSelfArg(),
      { name: 'from', type: 'Address' },
      { name: 'to', type: 'Address' },
      { name: 'token_id', type: 'U256' },
    ],
    returns: 'Result<(), Vec<u8>>',
    // safe to end the code with `?;`, as when this code is set, it will have surrounding code
    code: [`self.${erc721Trait.storage.name}.transfer_from(from, to, token_id)?;`],
  },
  safe_transfer_from: {
    args: [
      getSelfArg(),
      { name: 'from', type: 'Address' },
      { name: 'to', type: 'Address' },
      { name: 'token_id', type: 'U256' },
    ],
    returns: 'Result<(), Vec<u8>>',
    // safe to end the code with `?;`, as when this code is set, it will have surrounding code
    code: [`self.${erc721Trait.storage.name}.safe_transfer_from(from, to, token_id)?;`],
  },
  safe_transfer_from_with_data: {
    attribute: 'selector(name = "safeTransferFrom")',
    args: [
      getSelfArg(),
      { name: 'from', type: 'Address' },
      { name: 'to', type: 'Address' },
      { name: 'token_id', type: 'U256' },
      { name: 'data', type: 'Bytes' },
    ],
    returns: 'Result<(), Vec<u8>>',
    // safe to end the code with `?;`, as when this code is set, it will have surrounding code
    code: [`self.${erc721Trait.storage.name}.safe_transfer_from_with_data(from, to, token_id, data)?;`],
  },

  // Overrides
  supports_interface: {
    args: [{ name: 'interface_id', type: 'FixedBytes<4>' }],
    returns: 'bool',
    code: ['Erc721::supports_interface(interface_id)'],
  },

  // Extensions
  burn: {
    args: [getSelfArg(), { name: 'token_id', type: 'U256' }],
    returns: 'Result<(), Vec<u8>>',
    code: [`self.${erc721Trait.storage.name}.burn(token_id).map_err(|e| e.into())`],
  },
});
