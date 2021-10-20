import { Contract, ContractBuilder } from './contract';
import { Access, setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { supportsInterface } from './common-functions';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';

export interface ERC1155Options extends CommonOptions {
  name: string;
  uri: string;
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
}

export function buildERC1155(opts: ERC1155Options): Contract {
  const c = new ContractBuilder(opts.name);

  const { access, upgradeable, info } = withCommonDefaults(opts);

  addBase(c, opts.uri);
  addSetUri(c, access);

  if (opts.pausable) {
    addPausable(c, access, [functions._beforeTokenTransfer]);
  }

  if (opts.burnable) {
    addBurnable(c);
  }

  if (opts.mintable) {
    addMintable(c, access);
  }

  setUpgradeable(c, upgradeable, access);

  setInfo(c, info);

  return c;
}

function addBase(c: ContractBuilder, uri: string) {
  c.addParent(
    {
      name: 'ERC1155',
      path: '@openzeppelin/contracts/token/ERC1155/ERC1155.sol',
    },
    [uri],
  );

  c.addOverride('ERC1155', functions._beforeTokenTransfer);
  c.addOverride('ERC1155', supportsInterface);
}

function addBurnable(c: ContractBuilder) {
  c.addParent({
    name: 'ERC1155Burnable',
    path: '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Burnable.sol',
  });
}

function addMintable(c: ContractBuilder, access: Access) {
  setAccessControl(c, functions.mint, access, 'MINTER');
  setAccessControl(c, functions.mintBatch, access, 'MINTER');
  c.addFunctionCode('_mint(account, id, amount, data);', functions.mint);
  c.addFunctionCode('_mintBatch(to, ids, amounts, data);', functions.mintBatch);
}

function addSetUri(c: ContractBuilder, access: Access) {
  setAccessControl(c, functions.setURI, access, 'URI_SETTER');
  c.addFunctionCode('_setURI(newuri);', functions.setURI);
}

const functions = defineFunctions({
  _beforeTokenTransfer: {
    kind: 'internal' as const,
    args: [
      { name: 'operator', type: 'address' },
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'ids', type: 'uint256[] memory' },
      { name: 'amounts', type: 'uint256[] memory' },
      { name: 'data', type: 'bytes memory' },
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
