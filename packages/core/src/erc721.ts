import { BaseFunction, Contract, ContractBuilder } from './contract';
import { Access, setAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { supportsInterface } from './common-functions';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';

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
  votes?: boolean;
}

export function buildERC721(opts: ERC721Options): Contract {
  const c = new ContractBuilder(opts.name);

  const { access, upgradeable, info } = withCommonDefaults(opts);

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
    addMintable(c, access, opts.incremental, opts.uriStorage);
  }

  if (opts.votes) {
    addVotes(c);
  }

  setUpgradeable(c, upgradeable, access);

  setInfo(c, info);

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
  c.addOverride('ERC721', functions._afterTokenTransfer);
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

function addMintable(c: ContractBuilder, access: Access, incremental = false, uriStorage = false) {
  const fn = getMintFunction(incremental, uriStorage);
  setAccessControl(c, fn, access, 'MINTER');

  if (incremental) {
    c.addUsing({
      name: 'Counters',
      path: '@openzeppelin/contracts/utils/Counters.sol',
    }, 'Counters.Counter');
    c.addVariable('Counters.Counter private _tokenIdCounter;');
    c.addFunctionCode('uint256 tokenId = _tokenIdCounter.current();', fn);
    c.addFunctionCode('_tokenIdCounter.increment();', fn);
    c.addFunctionCode('_safeMint(to, tokenId);', fn);
  } else {
    c.addFunctionCode('_safeMint(to, tokenId);', fn);
  }

  if (uriStorage) {
    c.addFunctionCode('_setTokenURI(tokenId, uri);', fn);
  }
}

function addVotes(c: ContractBuilder) {
  c.addParent({
    name: 'ERC721Votes',
    path: '@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol',
  });
  c.addOverride('ERC721Votes', functions._afterTokenTransfer);
  c.addOverride('ERC721Votes', functions._getVotingUnits);
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

  _afterTokenTransfer: {
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

  _getVotingUnits: {
    kind: 'internal' as const,
    args: [
      { name: 'account', type: 'address' },
    ],
    returns: ['uint256'],
  },
});

function getMintFunction(incremental: boolean, uriStorage: boolean) {
  const fn = {
    name: 'safeMint',
    kind: 'public' as const,
    args: [
      { name: 'to', type: 'address' },
    ],
  };

  if (!incremental) {
    fn.args.push({ name: 'tokenId', type: 'uint256' });
  }

  if (uriStorage) {
    fn.args.push({ name: 'uri', type: 'string memory' });
  }

  return fn;
}
