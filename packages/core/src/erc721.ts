import { BaseFunction, Contract, ContractBuilder } from './contract';
import { Access, setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { supportsInterface } from './common-functions';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults } from './common-options';
import { setUpgradeable } from './set-upgradeable';

export interface ERC721Options extends CommonOptions {
  name: string;
  symbol: string;
  baseUri?: string;
  enumerable?: boolean;
  uriStorage?: boolean;
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
  incremental?: boolean;
}

export function buildERC721(opts: ERC721Options): Contract {
  const c = new ContractBuilder(opts.name);

  const { access, upgradeable } = withCommonDefaults(opts);

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

  if (opts.mintable) {
    addMintable(c, access, opts.incremental);
  }

  setUpgradeable(c, upgradeable, access);

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
  c.addOverride('ERC721', functions._burn);
  c.addOverride('ERC721', functions.tokenURI);
  c.addOverride('ERC721', supportsInterface);
}

function addBaseURI(c: ContractBuilder, baseUri: string) {
  c.addOverride('ERC721', functions._baseURI);
  c.setFunctionBody([`return ${JSON.stringify(baseUri)};`], functions._baseURI);
}

function addEnumerable(c: ContractBuilder) {
  c.addParent({
    name: 'ERC721Enumerable',
    path: '@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol',
  });

  c.addOverride('ERC721Enumerable', functions._beforeTokenTransfer);
  c.addOverride('ERC721Enumerable', supportsInterface);
}

function addURIStorage(c: ContractBuilder) {
  c.addParent({
    name: 'ERC721URIStorage',
    path: '@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol',
  });

  c.addOverride('ERC721URIStorage', functions._burn);
  c.addOverride('ERC721URIStorage', functions.tokenURI);
}

function addBurnable(c: ContractBuilder) {
  c.addParent({
    name: 'ERC721Burnable',
    path: '@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol',
  });
}

function addMintable(c: ContractBuilder, access: Access, incremental = false) {
  const fn = incremental ? mintFunctions.incremental : mintFunctions.regular;
  setAccessControl(c, fn, access, 'MINTER');
  if (incremental) {
    c.addUsing({
      name: 'Counters',
      path: '@openzeppelin/contracts/utils/Counters.sol',
    }, 'Counters.Counter');
    c.addVariable('Counters.Counter private _tokenIdCounter;');
    c.addFunctionCode('_safeMint(to, _tokenIdCounter.current());', fn);
    c.addFunctionCode('_tokenIdCounter.increment();', fn);
  } else {
    c.addFunctionCode('_safeMint(to, tokenId);', fn);
  }
}

const functions = defineFunctions({
  _beforeTokenTransfer: {
    kind: 'internal' as const,
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
  },

  _burn: {
    kind: 'internal' as const,
    args: [
      { name: 'tokenId', type: 'uint256' },
    ],
  },

  tokenURI: {
    kind: 'public' as const,
    args: [
      { name: 'tokenId', type: 'uint256' },
    ],
    returns: ['string memory'],
    mutability: 'view' as const,
  },

  _baseURI: {
    kind: 'internal' as const,
    args: [],
    returns: ['string memory'],
    mutability: 'pure' as const,
  },
});

const mintFunctions = {
  regular: {
    name: 'safeMint',
    kind: 'public' as const,
    args: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
    ],
  },

  incremental: {
    name: 'safeMint',
    kind: 'public' as const,
    args: [
      { name: 'to', type: 'address' },
    ],
  },
};
