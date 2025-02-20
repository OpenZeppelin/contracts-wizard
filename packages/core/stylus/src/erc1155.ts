import { Contract, ContractBuilder } from './contract';
import { addPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { CommonContractOptions, withCommonContractDefaults, getSelfArg } from './common-options';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { setAccessControl } from './set-access-control';
import { setInfo } from './set-info';

export const defaults: Required<ERC1155Options> = {
  name: 'MyToken',
  burnable: false,
  pausable: false,
  access: commonDefaults.access,
  info: commonDefaults.info,
} as const;

export function printERC1155(opts: ERC1155Options = defaults): string {
  return printContract(buildERC1155(opts));
}

export interface ERC1155Options extends CommonContractOptions {
  name: string;
  burnable?: boolean;
  pausable?: boolean;
}

function withDefaults(opts: ERC1155Options): Required<ERC1155Options> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
  };
}

export function isAccessControlRequired(opts: Partial<ERC1155Options>): boolean {
  return opts.pausable === true;
}

export function buildERC1155(opts: ERC1155Options): Contract {
  const c = new ContractBuilder(opts.name);

  const allOpts = withDefaults(opts);

  addBase(c, allOpts.pausable);

  if (allOpts.pausable) {
    addPausable(c, allOpts.access);
  }

  if (allOpts.burnable) {
    addBurnable(c, allOpts.pausable);
  }

  setAccessControl(c, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

function addBase(c: ContractBuilder, pausable: boolean) {
  // Add the base traits
  c.addUseClause('openzeppelin_stylus::token::erc1155', 'Erc1155');
  c.addUseClause('openzeppelin_stylus::token::erc1155', 'IErc1155');
  // c.addUseClause('openzeppelin_stylus::token::erc1155::extensions', 'Erc1155Metadata');
  c.addImplementedTrait(erc1155Trait);
  // c.addImplementedTrait(erc1155MetadataTrait);

  // Override IErc65 from Erc1155
  c.addUseClause('openzeppelin_stylus::utils', 'introspection::erc165::IErc165');
  c.addUseClause('alloy_primitives', 'FixedBytes');
  c.addFunction(erc1155Trait, functions.supports_interface); // TODO: This is currently hardcoded to call Erc1155. If other overrides are needed, consider a more generic solution. See Solidity's addOverride function in `packages/core/solidity/src/contract.ts` for example

  if (pausable) {
    // Add transfer functions with pause checks
    c.addUseClause('alloc::vec', 'Vec');
    c.addUseClause('alloy_primitives', 'Address');
    c.addUseClause('alloy_primitives', 'U256');

    // c.addFunctionCodeBefore(erc1155Trait, functions.safe_transfer_from, ['self.pausable.when_not_paused()?;']);
    // c.addFunctionCodeBefore(erc1155Trait, functions.safe_batch_transfer_from, ['self.pausable.when_not_paused()?;']);
  }
}

function addBurnable(c: ContractBuilder, pausable: boolean) {
  c.addUseClause('openzeppelin_stylus::token::erc1155::extensions', 'IErc1155Burnable');

  c.addUseClause('alloc::vec', 'Vec');
  c.addUseClause('alloy_primitives', 'Address');
  c.addUseClause('alloy_primitives', 'U256');

  c.addFunction(erc1155Trait, functions.burn);
  c.addFunction(erc1155Trait, functions.burn_batch);

  if (pausable) {
    c.addFunctionCodeBefore(erc1155Trait, functions.burn, ['self.pausable.when_not_paused()?;']);
    c.addFunctionCodeBefore(erc1155Trait, functions.burn_batch, ['self.pausable.when_not_paused()?;']);
  }
}

const erc1155Trait = {
  name: 'Erc1155',
  storage: {
    name: 'erc1155',
    type: 'Erc1155',
  },
};

// const erc1155MetadataTrait = {
//   name: 'Erc1155Metadata',
//   storage: {
//     name: 'metadata',
//     type: 'Erc1155Metadata',
//   }
// }

const functions = defineFunctions({
  // Token Functions

  // Overrides
  supports_interface: {
    args: [{ name: 'interface_id', type: 'FixedBytes<4>' }],
    returns: 'bool',
    code: ['Erc1155::supports_interface(interface_id)'],
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
    code: ['self.erc1155.burn(account, token_id, value).map_err(|e| e.into())'],
  },
  burn_batch: {
    args: [
      getSelfArg(),
      { name: 'account', type: 'Address' },
      { name: 'token_ids', type: 'Vec<U256>' },
      { name: 'values', type: 'Vec<U256>' },
    ],
    returns: 'Result<(), Vec<u8>>',
    code: ['self.erc1155.burn_batch(account, token_ids, values).map_err(|e| e.into())'],
  },
});
