import { Contract, ContractBuilder } from './contract';
import { Access, setAccessControl, requireAccessControl } from './set-access-control';
import { addPauseFunctions } from './add-pausable';
import { supportsInterface } from './common-functions';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults, defaults as commonDefaults } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { printContract } from './print';

export interface ERC1155Options extends CommonOptions {
  name: string;
  uri: string;
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
  supply?: boolean;
  updatableUri?: boolean;
}

export const defaults: Required<ERC1155Options> = {
  name: 'MyToken',
  uri: '',
  burnable: false,
  pausable: false,
  mintable: false,
  supply: false,
  updatableUri: true,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info
} as const;

function withDefaults(opts: ERC1155Options): Required<ERC1155Options> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    mintable: opts.mintable ?? defaults.mintable,
    supply: opts.supply ?? defaults.supply,
    updatableUri: opts.updatableUri ?? defaults.updatableUri,
  };
}

export function printERC1155(opts: ERC1155Options = defaults): string {
  return printContract(buildERC1155(opts));
}

export function isAccessControlRequired(opts: Partial<ERC1155Options>): boolean {
  return opts.mintable || opts.pausable || opts.updatableUri !== false || opts.upgradeable === 'uups';
}

export function buildERC1155(opts: ERC1155Options): Contract {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  const { access, upgradeable, info } = allOpts;

  addBase(c, allOpts.uri);

  if (allOpts.updatableUri) {
    addSetUri(c, access);
  }

  if (allOpts.pausable) {
    addPausableExtension(c, access);
  }

  if (allOpts.burnable) {
    addBurnable(c);
  }

  if (allOpts.mintable) {
    addMintable(c, access);
  }

  if (allOpts.supply) {
    addSupply(c);
  }

  setAccessControl(c, access);
  setUpgradeable(c, upgradeable, access);
  setInfo(c, info);

  return c;
}

function addBase(c: ContractBuilder, uri: string) {
  const ERC1155 = {
    name: 'ERC1155',
    path: '@openzeppelin/contracts/token/ERC1155/ERC1155.sol',
  };
  c.addParent(ERC1155, [uri]);

  c.addOverride(ERC1155, functions._update);
  c.addOverride(ERC1155, supportsInterface);
}

function addPausableExtension(c: ContractBuilder, access: Access) {
  const ERC1155Pausable = {
    name: 'ERC1155Pausable',
    path: '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Pausable.sol',
  };
  c.addParent(ERC1155Pausable);
  c.addOverride(ERC1155Pausable, functions._update);

  addPauseFunctions(c, access);
}

function addBurnable(c: ContractBuilder) {
  c.addParent({
    name: 'ERC1155Burnable',
    path: '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol',
  });
}

function addMintable(c: ContractBuilder, access: Access) {
  requireAccessControl(c, functions.mint, access, 'MINTER', 'minter');
  requireAccessControl(c, functions.mintBatch, access, 'MINTER', 'minter');
  c.addFunctionCode('_mint(account, id, amount, data);', functions.mint);
  c.addFunctionCode('_mintBatch(to, ids, amounts, data);', functions.mintBatch);
}

function addSetUri(c: ContractBuilder, access: Access) {
  requireAccessControl(c, functions.setURI, access, 'URI_SETTER', undefined);
  c.addFunctionCode('_setURI(newuri);', functions.setURI);
}

function addSupply(c: ContractBuilder) {
  const ERC1155Supply = {
    name: 'ERC1155Supply',
    path: '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Supply.sol',
  };
  c.addParent(ERC1155Supply);
  c.addOverride(ERC1155Supply, functions._update);
}

const functions = defineFunctions({
  _update: {
    kind: 'internal' as const,
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'ids', type: 'uint256[] memory' },
      { name: 'values', type: 'uint256[] memory' },
    ],
  },

  setURI: {
    kind: 'public' as const,
    args: [
      { name: 'newuri', type: 'string memory' },
    ],
  },

  mint: {
    kind: 'public' as const,
    args: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
      { name: 'amount', type: 'uint256' },
      { name: 'data', type: 'bytes memory' },
    ],
  },

  mintBatch: {
    kind: 'public' as const,
    args: [
      { name: 'to', type: 'address' },
      { name: 'ids', type: 'uint256[] memory' },
      { name: 'amounts', type: 'uint256[] memory' },
      { name: 'data', type: 'bytes memory' },
    ],
  },
});
