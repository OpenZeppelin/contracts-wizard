import { Contract, ContractBuilder, BaseFunction } from './contract';
import type { Access } from './set-access-control';
import { addPausable } from './add-pausable';

export interface ERC721Options {
  name: string;
  symbol: string;
  baseUri?: string;
  enumerable?: boolean;
  uriStorage?: boolean;
  burnable?: boolean;
  pausable?: boolean;
  access?: Access;
}

export function buildERC721(opts: ERC721Options): Contract {
  const c = new ContractBuilder(opts.name);

  const { access = 'ownable' } = opts;

  addBase(c, opts.name, opts.symbol);

  if (opts.baseUri) {
    addBaseURI(c, opts.baseUri);
  }

  if (opts.enumerable) {
    addEnumerable(c);
  }

  if (opts.uriStorage) {
    addURIStorage(c);
  }

  if (opts.pausable) {
    addPausable(c, access, [functions._beforeTokenTransfer]);
  }

  if (opts.burnable) {
    addBurnable(c);
  }

  return c;
}

function addBase(c: ContractBuilder, name: string, symbol: string) {
  c.addParent(
    {
      name: 'ERC721',
      path: '@openzeppelin/contracts/token/ERC721/ERC721.sol',
    },
    [name, symbol],
  );

  c.addOverride('ERC721', functions._beforeTokenTransfer);
}

function addBaseURI(c: ContractBuilder, baseUri: string) {
  c.addOverride('ERC721', functions._baseURI);
  c.setFunctionBody(`return ${JSON.stringify(baseUri)};`, functions._baseURI);
}

function addEnumerable(c: ContractBuilder) {
  c.addParent({
    name: 'ERC721Enumerable',
    path: '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol',
  });
}

function addURIStorage(c: ContractBuilder) {
  c.addParent({
    name: 'ERC721URIStorage',
    path: '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol',
  });

  c.addOverride('ERC721URIStorage', functions._beforeTokenTransfer);
  c.addOverride('ERC721URIStorage', functions._burn);
}

function addBurnable(c: ContractBuilder) {
  c.addParent({
    name: 'ERC721Burnable',
    path: '@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol',
  });

  c.addOverride('ERC721Burnable', functions._burn);
}

const functions = {
  _beforeTokenTransfer: {
    name: '_beforeTokenTransfer',
    kind: 'internal' as const,
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
  },

  _burn: {
    name: '_burn',
    kind: 'internal' as const,
    args: [
      { name: 'tokenId', type: 'uint256' },
    ],
  },

  _baseURI: {
    name: '_baseURI',
    kind: 'internal' as const,
    args: [],
  },
};
