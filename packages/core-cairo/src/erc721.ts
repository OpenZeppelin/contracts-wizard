import { BaseFunction, Contract, ContractBuilder } from './contract';
import { Access, setAccessControl } from './set-access-control';
import { addPausable, setPausable } from './add-pausable';
// import { supportsInterface } from './common-functions';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults, withImplicitArgs } from './common-options';
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
}

export function buildERC721(opts: ERC721Options): Contract {
  const c = new ContractBuilder(opts.name);

  const { access, upgradeable, info } = withCommonDefaults(opts);

  addBase(c, opts.name, opts.symbol);

  c.addParentLibrary(
    {
      prefix: 'ERC165', // TODO add an import (rather than a parent library) to a map without relying on prefix, since prefix does not make sense in context of some libs such as utils
      modulePath: 'openzeppelin.introspection.ERC165',
    },
    [],
    ['ERC165_supports_interface'],
    false
  );
  c.addFunction(functions.supports_interface);

  c.addFunction(functions.name);
  c.addFunction(functions.symbol);
  c.addFunction(functions.balanceOf);
  c.addFunction(functions.ownerOf);
  c.addFunction(functions.getApproved);
  c.addFunction(functions.isApprovedForAll);

  c.addFunction(functions.approve);
  c.addFunction(functions.setApprovalForAll);
  c.addFunction(functions.transferFrom);
  c.addFunction(functions.safeTransferFrom);

  // if (opts.baseUri) {
  //   addBaseURI(c, opts.baseUri);
  // }

  // if (opts.enumerable) {
  //   addEnumerable(c);
  // }

  if (opts.uriStorage) {
    addURIStorage(c, access);
  }

  if (opts.pausable) {
    addPausable(c, access, [functions.approve, functions.setApprovalForAll, functions.transferFrom, functions.safeTransferFrom]);
    if (opts.burnable) {
      setPausable(c, functions.burn);
    }
    if (opts.mintable) {
      setPausable(c, functions.mint);
    }
  }

  if (opts.burnable) {
    addBurnable(c);
  }

  if (opts.mintable) {
    addMintable(c, access);//, opts.incremental, opts.uriStorage);
  }

  setUpgradeable(c, upgradeable);//, access);

  setInfo(c, info);

  return c;
}

function addBase(c: ContractBuilder, name: string, symbol: string) {
  c.addParentLibrary(
    {
      prefix: 'ERC721',
      modulePath: 'openzeppelin/token/erc721/library',
    },
    [name, symbol],
    ['ERC721_approve', 'ERC721_setApprovalForAll', 'ERC721_transferFrom', 'ERC721_safeTransferFrom', 'ERC721_initializer', ],
    // TODO use initializable boolean to determine if parent initializer is imported
  );
}

// function addBase(c: ContractBuilder, name: string, symbol: string) {
//   c.addParent(
//     {
//       name: 'ERC721',
//       path: 'openzeppelin/contracts/token/ERC721/ERC721',
//     },
//     [name, symbol],
//   );

//   c.addOverride('ERC721', functions._beforeTokenTransfer);
//   c.addOverride('ERC721', functions._burn);
//   c.addOverride('ERC721', functions.tokenURI);
//   c.addOverride('ERC721', supportsInterface);
// }

// function addBaseURI(c: ContractBuilder, baseUri: string) {
//   c.addOverride('ERC721', functions._baseURI);
//   c.setFunctionBody([`return ${JSON.stringify(baseUri)};`], functions._baseURI);
// }

// function addEnumerable(c: ContractBuilder) {
//   c.addParent({
//     name: 'ERC721Enumerable',
//     path: 'openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable',
//   });

//   c.addOverride('ERC721Enumerable', functions._beforeTokenTransfer);
//   c.addOverride('ERC721Enumerable', supportsInterface);
// }

function addURIStorage(c: ContractBuilder, access: Access) {
  c.addFunction(functions.tokenURI);
  setAccessControl(c, functions.setTokenURI, access);
  c.addFunction(functions.setTokenURI);


  // c.addParent({
  //   name: 'ERC721URIStorage',
  //   path: 'openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage',
  // });

  // c.addOverride('ERC721URIStorage', functions._burn);
  // c.addOverride('ERC721URIStorage', functions.tokenURI);
}



function addBurnable(c: ContractBuilder) {
  c.addFunction(functions.burn);
  c.addParentFunctionImport(
    // TODO have a way when defining the function to specify that this has multiple "base" functions (e.g. multiple parents)
    'ERC721',
    'ERC721_only_token_owner',
  );
  c.setFunctionBody(
    ['ERC721_only_token_owner(tokenId)', 'ERC721_burn(tokenId)'],
     functions.burn
  );
}

// function addBurnable(c: ContractBuilder) {
//   c.addParent({
//     name: 'ERC721Burnable',
//     path: 'openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable',
//   });
// }

function addMintable(c: ContractBuilder, access: Access) {
  setAccessControl(c, functions.mint, access, 'MINTER');
  //c.addFunctionCode('_mint(to, amount);', functions.mint);
}

// function addMintable(c: ContractBuilder, access: Access, incremental = false, uriStorage = false) {
//   const fn = getMintFunction(incremental, uriStorage);
//   setAccessControl(c, fn, access, 'MINTER');

//   if (incremental) {
//     c.addUsing({
//       name: 'Counters',
//       path: 'openzeppelin/contracts/utils/Counters',
//     }, 'Counters.Counter');
//     c.addVariable('Counters.Counter private _tokenIdCounter;');
//     c.addFunctionCode('uint256 tokenId = _tokenIdCounter.current();', fn);
//     c.addFunctionCode('_tokenIdCounter.increment();', fn);
//     c.addFunctionCode('_safeMint(to, tokenId);', fn);
//   } else {
//     c.addFunctionCode('_safeMint(to, tokenId);', fn);
//   }

//   if (uriStorage) {
//     c.addFunctionCode('_setTokenURI(tokenId, uri);', fn);
//   }
// }





 const functions = defineFunctions({


  // --- view functions ---


  supports_interface: {
    module: 'ERC165',
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'interfaceId', type: 'felt' },
    ],
    returns: [{ name: 'success', type: 'felt' }],
    passthrough: true,
    // TODO support different library function name, and remove adding separate import
  },

  name: {
    module: 'ERC721',
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
    ],
    returns: [{ name: 'name', type: 'felt' }],
    passthrough: true,
  },

  symbol: {
    module: 'ERC721',
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
    ],
    returns: [{ name: 'symbol', type: 'felt' }],
    passthrough: true,
  },

  balanceOf: {
    module: 'ERC721',
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'owner', type: 'felt' },
    ],
    returns: [{ name: 'balance', type: 'Uint256' }],
    passthrough: true,
  },

  ownerOf: {
    module: 'ERC721',
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'token_id', type: 'Uint256' },
    ],
    returns: [{ name: 'owner', type: 'felt' }],
    passthrough: true,
  },

  getApproved: {
    module: 'ERC721',
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'token_id', type: 'Uint256' },
    ],
    returns: [{ name: 'approved', type: 'felt' }],
    passthrough: true,
  },

  isApprovedForAll: {
    module: 'ERC721',
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'owner', type: 'felt' },
      { name: 'operator', type: 'felt' },
    ],
    returns: [{ name: 'isApproved', type: 'felt' }],
    passthrough: true,
  },

  tokenURI: {
    module: 'ERC721',
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'tokenId', type: 'Uint256' },
    ],
    returns: [{ name: 'tokenURI', type: 'felt' }],
    passthrough: true,
  },

  // --- external functions ---


  approve: {
    module: 'ERC721',
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'to', type: 'felt' },
      { name: 'tokenId', type: 'Uint256' },
    ],
  },

  setApprovalForAll: {
    module: 'ERC721',
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'operator', type: 'felt' },
      { name: 'approved', type: 'felt' },
    ],
  },

  transferFrom: {
    module: 'ERC721',
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: '_from', type: 'felt' },
      { name: 'to', type: 'felt' },
      { name: 'tokenId', type: 'Uint256' },
    ],
  },

  safeTransferFrom: {
    module: 'ERC721',
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: '_from', type: 'felt' },
      { name: 'to', type: 'felt' },
      { name: 'tokenId', type: 'Uint256' },
      { name: 'data_len', type: 'felt' },
      { name: 'data', type: 'felt*' },
    ],
  },

  setTokenURI: {
    module: 'ERC721',
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'tokenId', type: 'Uint256' },
      { name: 'tokenURI', type: 'felt' },
    ],
  },

  mint: {
    module: 'ERC721',
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'to', type: 'felt' },
      { name: 'tokenId', type: 'Uint256' },
    ],
  },
  
  burn: {
    module: 'ERC721',
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'tokenId', type: 'Uint256' },
    ],
  },

});

// function getMintFunction(incremental: boolean, uriStorage: boolean) {
//   const fn = {
//     name: 'safeMint',
//     kind: 'external' as const,
//     args: [
//       { name: 'to', type: 'address' },
//     ],
//   };

//   if (!incremental) {
//     fn.args.push({ name: 'tokenId', type: 'uint256' });
//   }

//   if (uriStorage) {
//     fn.args.push({ name: 'uri', type: 'string memory' });
//   }

//   return fn;
// }
