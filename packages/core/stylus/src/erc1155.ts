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

export interface ERC1155Options extends CommonContractOptions {
  name: string;
  burnable?: boolean;
  pausable?: boolean;
  supply?: boolean;
}

export const defaults: Required<ERC1155Options> = {
  name: 'MyToken',
  burnable: false,
  pausable: false,
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
    pausable: opts.pausable ?? defaults.pausable,
    supply: opts.supply ?? defaults.supply,
  };
}

export function isAccessControlRequired(opts: Partial<ERC1155Options>): boolean {
  return opts.pausable === true;
}

export function buildERC1155(opts: ERC1155Options): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  // Erc1155Supply reexports Erc1155 functionality
  const trait = allOpts.supply ? addSupply(c, allOpts.pausable) : addBase(c, allOpts.pausable);

  addMetadata(c);

  if (allOpts.pausable) {
    addPausable(c, allOpts.access);
  }

  if (allOpts.burnable) {
    addBurnable(c, allOpts.pausable, trait);
  }

  setAccessControl(c, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

function addBase(c: ContractBuilder, _pausable: boolean): BaseImplementedTrait {
  // Add the base traits
  c.addUseClause('openzeppelin_stylus::token::erc1155', 'Erc1155');
  c.addUseClause('openzeppelin_stylus::token::erc1155', 'IErc1155');

  c.addImplementedTrait(erc1155Trait);

  // Override IErc65 from Erc1155
  c.addUseClause('openzeppelin_stylus::utils', 'introspection::erc165::IErc165');
  c.addUseClause('alloy_primitives', 'FixedBytes');
  c.addFunction(erc1155Trait, functions(erc1155Trait).supports_interface); // TODO: This is currently hardcoded to call Erc1155. If other overrides are needed, consider a more generic solution. See Solidity's addOverride function in `packages/core/solidity/src/contract.ts` for example

  // if (pausable) {
  // Add transfer functions with pause checks
  // c.addUseClause('alloc::vec', 'Vec');
  // c.addUseClause('alloy_primitives', 'Address');
  // c.addUseClause('alloy_primitives', 'U256');

  // c.addFunctionCodeBefore(erc1155Trait, functions(erc1155Trait).safe_transfer_from, ['self.pausable.when_not_paused()?;']);
  // c.addFunctionCodeBefore(erc1155Trait, functions(erc1155Trait).safe_batch_transfer_from, ['self.pausable.when_not_paused()?;']);
  // }

  return erc1155Trait;
}

function addSupply(c: ContractBuilder, _pausable: boolean): BaseImplementedTrait {
  c.addUseClause('openzeppelin_stylus::token::erc1155::extensions', 'Erc1155Supply');
  c.addUseClause('openzeppelin_stylus::token::erc1155', 'IErc1155');

  c.addImplementedTrait(erc1155SupplyTrait);

  const fns = functions(erc1155SupplyTrait);

  c.addFunction(erc1155SupplyTrait, fns.total_supply);
  c.addFunction(erc1155SupplyTrait, fns.total_supply_all);
  c.addFunction(erc1155SupplyTrait, fns.exists);

  // Override IErc65 from Erc1155
  c.addUseClause('openzeppelin_stylus::utils', 'introspection::erc165::IErc165');
  c.addUseClause('alloy_primitives', 'FixedBytes');
  c.addFunction(erc1155SupplyTrait, fns.supports_interface); // TODO: This is currently hardcoded to call Erc1155. If other overrides are needed, consider a more generic solution. See Solidity's addOverride function in `packages/core/solidity/src/contract.ts` for example

  // if (pausable) {
  //   // Add pausable checks to appropriate functions
  // }

  return erc1155SupplyTrait;
}

function addMetadata(_c: ContractBuilder) {
  // c.addUseClause('openzeppelin_stylus::token::erc1155::extensions', 'Erc1155Metadata');
  // c.addImplementedTrait(erc1155MetadataTrait);
}

function addBurnable(c: ContractBuilder, pausable: boolean, trait: BaseImplementedTrait) {
  c.addUseClause('openzeppelin_stylus::token::erc1155::extensions', 'IErc1155Burnable');

  c.addUseClause('alloc::vec', 'Vec');
  c.addUseClause('alloy_primitives', 'Address');
  c.addUseClause('alloy_primitives', 'U256');

  const fns = functions(trait);

  c.addFunction(trait, fns.burn);
  c.addFunction(trait, fns.burn_batch);

  if (pausable) {
    c.addFunctionCodeBefore(trait, fns.burn, ['self.pausable.when_not_paused()?;']);
    c.addFunctionCodeBefore(trait, fns.burn_batch, ['self.pausable.when_not_paused()?;']);
  }
}

const erc1155Trait: BaseImplementedTrait = {
  name: 'Erc1155',
  storage: {
    name: 'erc1155',
    type: 'Erc1155',
  },
};

const erc1155SupplyTrait: BaseImplementedTrait = {
  name: 'Erc1155Supply',
  storage: {
    name: 'erc1155_supply',
    type: 'Erc1155Supply',
  },
};

// const erc1155MetadataTrait: BaseImplementedTrait = {
//   name: 'Erc1155Metadata',
//   storage: {
//     name: 'metadata',
//     type: 'Erc1155Metadata',
//   }
// }

const functions = (trait: BaseImplementedTrait) =>
  defineFunctions({
    // Token Functions

    // Overrides
    supports_interface: {
      args: [{ name: 'interface_id', type: 'FixedBytes<4>' }],
      returns: 'bool',
      code: [`${erc1155Trait.storage.type}::supports_interface(interface_id)`],
    },

    // Extensions
    burn: {
      args: [
        getSelfArg(),
        { name: 'account', type: 'Address' },
        { name: 'token_id', type: 'U256' },
        { name: 'value', type: 'U256' },
      ],
      returns: 'Result<(), Vec<u8>>',
      code: [`self.${trait.storage.name}.burn(account, token_id, value).map_err(|e| e.into())`],
    },
    burn_batch: {
      args: [
        getSelfArg(),
        { name: 'account', type: 'Address' },
        { name: 'token_ids', type: 'Vec<U256>' },
        { name: 'values', type: 'Vec<U256>' },
      ],
      returns: 'Result<(), Vec<u8>>',
      code: [`self.${trait.storage.name}.burn_batch(account, token_ids, values).map_err(|e| e.into())`],
    },

    total_supply: {
      args: [getSelfArg('immutable'), { name: 'id', type: 'U256' }],
      returns: 'U256',
      code: [`self.${trait.storage.name}.total_supply(id)`],
    },
    total_supply_all: {
      attribute: 'selector(name = "totalSupply")',
      args: [getSelfArg('immutable')],
      returns: 'U256',
      code: [`self.${trait.storage.name}.total_supply_all()`],
    },
    exists: {
      args: [getSelfArg('immutable'), { name: 'id', type: 'U256' }],
      returns: 'bool',
      code: [`self.${trait.storage.name}.exists(id)`],
    },
  });
