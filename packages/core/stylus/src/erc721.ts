import { Contract, ContractBuilder } from './contract';
import { addPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { CommonContractOptions, withCommonContractDefaults, getSelfArg } from './common-options';
import { contractDefaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { setAccessControl } from './set-access-control';
import { setInfo } from './set-info';

export const defaults: Required<ERC721Options> = {
  name: 'MyToken',
  burnable: false,
  pausable: false,
  access: commonDefaults.access,
  info: commonDefaults.info,
} as const;

export function printERC721(opts: ERC721Options = defaults): string {
  return printContract(buildERC721(opts));
}

export interface ERC721Options extends CommonContractOptions {
  name: string;
  burnable?: boolean;
  pausable?: boolean;
}

function withDefaults(opts: ERC721Options): Required<ERC721Options> {
  return {
    ...opts,
    ...withCommonContractDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
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
    addBurnable(c, allOpts.pausable);
  }

  setAccessControl(c, allOpts.access);
  setInfo(c, allOpts.info);

  return c;
}

function addBase(c: ContractBuilder, pausable: boolean) {
  // Add the base traits
  c.addUseClause('openzeppelin_stylus::token::erc721', 'Erc721');
  c.addUseClause('openzeppelin_stylus::token::erc721', 'IErc721');
  // c.addUseClause('openzeppelin_stylus::token::erc721::extensions', 'Erc721Metadata');
  c.addImplementedTrait(erc721Trait);
  // c.addImplementedTrait(erc721MetadataTrait);

  // Call nested IErc65 from Erc721
  c.addUseClause('openzeppelin_stylus::utils', 'introspection::erc165::IErc165');
  c.addUseClause('alloy_primitives', 'FixedBytes');
  c.addFunction(erc721Trait, functions.supports_interface); // TODO: This is currently hardcoded to call Erc721. If other overrides are needed, consider a more generic solution. See Solidity's addOverride function in `packages/core/solidity/src/contract.ts` for example

  if (pausable) {
    // Add transfer functions with pause checks
    c.addUseClause('alloc::vec', 'Vec');
    c.addUseClause('alloy_primitives', 'Address');
    c.addUseClause('alloy_primitives', 'U256');

    c.addFunctionCodeBefore(erc721Trait, functions.transfer, ['self.pausable.when_not_paused()?;']);
    c.addFunctionCodeBefore(erc721Trait, functions.transfer_from, ['self.pausable.when_not_paused()?;']);
  }
}

function addBurnable(c: ContractBuilder, pausable: boolean) {
  c.addUseClause('openzeppelin_stylus::token::erc721::extensions', 'IErc721Burnable');

  c.addUseClause('alloc::vec', 'Vec');
  c.addUseClause('alloy_primitives', 'U256');

  c.addFunction(erc721Trait, functions.burn);

  if (pausable) {
    c.addFunctionCodeBefore(erc721Trait, functions.burn, ['self.pausable.when_not_paused()?;']);
  }
}

const erc721Trait = {
  name: 'Erc721',
  storage: {
    name: 'erc721',
    type: 'Erc721',
  },
};

// const erc721MetadataTrait = {
//   name: 'Erc721Metadata',
//   storage: {
//     name: 'metadata',
//     type: 'Erc721Metadata',
//   }
// }

const functions = defineFunctions({
  // Token Functions
  transfer: {
    args: [getSelfArg(), { name: 'to', type: 'Address' }, { name: 'value', type: 'U256' }],
    returns: 'Result<bool, Vec<u8>>',
    visibility: 'pub',
    code: ['self.erc721.transfer(to, value).map_err(|e| e.into())'],
  },
  transfer_from: {
    args: [
      getSelfArg(),
      { name: 'from', type: 'Address' },
      { name: 'to', type: 'Address' },
      { name: 'value', type: 'U256' },
    ],
    returns: 'Result<bool, Vec<u8>>',
    visibility: 'pub',
    code: ['self.erc721.transfer_from(from, to, value).map_err(|e| e.into())'],
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
    visibility: 'pub',
    code: ['self.erc721.burn(token_id).map_err(|e| e.into())'],
  },
});
