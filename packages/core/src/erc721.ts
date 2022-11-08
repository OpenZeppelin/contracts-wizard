import { Contract, ContractBuilder } from './contract';
import { Access, setAccessControl, requireAccessControl } from './set-access-control';
import { addPausable } from './add-pausable';
import { supportsInterface } from './common-functions';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults, defaults as commonDefaults } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { printContract } from './print';

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

export const defaults: Required<ERC721Options> = {
  name: 'MyToken',
  symbol: 'MTK',
  baseUri: '',
  enumerable: false,
  uriStorage: false,
  burnable: false,
  pausable: false,
  mintable: false,
  incremental: false,
  votes: false,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info
} as const;

function withDefaults(opts: ERC721Options): Required<ERC721Options> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    baseUri: opts.baseUri ?? defaults.baseUri,
    enumerable: opts.enumerable ?? defaults.enumerable,
    uriStorage: opts.uriStorage ?? defaults.uriStorage,
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    mintable: opts.mintable ?? defaults.mintable,
    incremental: opts.incremental ?? defaults.incremental,
    votes: opts.votes ?? defaults.votes,
  };
}

export function printERC721(opts: ERC721Options = defaults): string {
  return printContract(buildERC721(opts));
}

export function isAccessControlRequired(opts: Partial<ERC721Options>): boolean {
  return opts.mintable || opts.pausable || opts.upgradeable === 'uups';
}

export function buildERC721(opts: ERC721Options): Contract {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  const { access, upgradeable, info } = allOpts;

  addBase(c, allOpts.name, allOpts.symbol);

  if (allOpts.baseUri) {
    addBaseURI(c, allOpts.baseUri);
  }

  if (allOpts.enumerable) {
    addEnumerable(c);
  }

  if (allOpts.uriStorage) {
    addURIStorage(c);
  }

  if (allOpts.pausable) {
    addPausable(c, access, [functions._beforeTokenTransfer]);
  }

  if (allOpts.burnable) {
    addBurnable(c);
  }

  if (allOpts.mintable) {
    addMintable(c, access, allOpts.incremental, allOpts.uriStorage);
  }

  if (allOpts.votes) {
    addVotes(c, allOpts.name);
  }

  setAccessControl(c, access);
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
  requireAccessControl(c, fn, access, 'MINTER');

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

function addVotes(c: ContractBuilder, name: string) {
  c.addParent(
    {
      name: 'EIP712',
      path: '@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol',
    },
    [name, "1"]
  );
  c.addParent(
    {
      name: 'ERC721Votes',
      path: '@openzeppelin/contracts/token/ERC721/extensions/draft-ERC721Votes.sol',
    });
  c.addOverride('ERC721Votes', functions._afterTokenTransfer);
}

const functions = defineFunctions({
  _beforeTokenTransfer: {
    kind: 'internal' as const,
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'batchSize', type: 'uint256' },
    ],
  },

  _afterTokenTransfer: {
    kind: 'internal' as const,
    args: [
      { name: 'from', type: 'address' },
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'batchSize', type: 'uint256' },
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
