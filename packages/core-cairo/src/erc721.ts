import { Contract, ContractBuilder } from './contract';
import { Access, requireAccessControl, setAccessControlForContract } from './set-access-control';
import { addPausable, setPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults, withImplicitArgs } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { defineModules } from './utils/define-modules';
import { defaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { defineNamespaces } from './utils/define-namespaces';
import { importUint256 } from './utils/uint256';

export const defaults: Required<ERC721Options> = {
  name: 'MyToken',
  symbol: 'MTK',
  burnable: false,
  pausable: false,
  mintable: false,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info
} as const;

export function printERC721(opts: ERC721Options = defaults): string {
  return printContract(buildERC721(opts));
}

export interface ERC721Options extends CommonOptions {
  name: string;
  symbol: string;
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
}

function withDefaults(opts: ERC721Options): Required<ERC721Options> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    mintable: opts.mintable ?? defaults.mintable,
  };
}

export function isAccessControlRequired(opts: Partial<ERC721Options>): boolean {
  return opts.mintable === true || opts.pausable === true;
}

export function buildERC721(opts: ERC721Options): Contract {
  const c = new ContractBuilder();

  const allOpts = withDefaults(opts);

  addBase(c, allOpts.name, allOpts.symbol);
  addSupportsInterface(c);

  c.addFunction(functions.name);
  c.addFunction(functions.symbol);
  c.addFunction(functions.balanceOf);
  c.addFunction(functions.ownerOf);
  c.addFunction(functions.getApproved);
  c.addFunction(functions.isApprovedForAll);
  c.addFunction(functions.tokenURI);

  c.addFunction(functions.approve);
  c.addFunction(functions.setApprovalForAll);
  c.addFunction(functions.transferFrom);
  c.addFunction(functions.safeTransferFrom);

  importUint256(c);

  if (allOpts.pausable) {
    addPausable(c, allOpts.access, [functions.approve, functions.setApprovalForAll, functions.transferFrom, functions.safeTransferFrom]);
    if (allOpts.burnable) {
      setPausable(c, functions.burn);
    }
    if (allOpts.mintable) {
      setPausable(c, functions.safeMint);
    }
  }

  if (allOpts.burnable) {
    addBurnable(c);
  }

  if (allOpts.mintable) {
    addMintable(c, allOpts.access);
  }

  setAccessControlForContract(c, allOpts.access);
  setUpgradeable(c, allOpts.upgradeable);

  setInfo(c, allOpts.info);

  return c;
}

function addSupportsInterface(c: ContractBuilder) {
  c.addModule(
    modules.ERC165, [], [], false
  );
  c.addFunction(functions.supportsInterface);
}

function addBase(c: ContractBuilder, name: string, symbol: string) {
  c.addModule(
    modules.ERC721,
    [name, symbol],
    [functions.approve, functions.setApprovalForAll, functions.transferFrom, functions.safeTransferFrom],
    true,
    namespaces.ERC721
  );
}

function addBurnable(c: ContractBuilder) {
  c.addFunction(functions.burn);
  c.setFunctionBody(
    [
      'ERC721.assert_only_token_owner(tokenId)',
      'ERC721._burn(tokenId)'
    ],
    functions.burn
  );
}

function addMintable(c: ContractBuilder, access: Access) {
  requireAccessControl(c, functions.safeMint, access);
  c.setFunctionBody(
    [
      'ERC721._safe_mint(to, tokenId, data_len, data)', 
      'ERC721._set_token_uri(tokenId, tokenURI)'
    ],
    functions.safeMint
  );
}

const modules = defineModules( {
  ERC165: {
    path: 'openzeppelin.introspection.library.ERC165',
    usePrefix: true
  },

  ERC721: {
    path: 'openzeppelin.token.erc721.library.ERC721',
    usePrefix: true
  },
})

const namespaces = defineNamespaces( {
  ERC165: {
    module: modules.ERC165,
  },

  ERC721: {
    module: modules.ERC721,
  },
})

const functions = defineFunctions({

  // --- view functions ---

  supportsInterface: {
    module: modules.ERC165,
    namespace: namespaces.ERC165,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'interfaceId', type: 'felt' },
    ],
    returns: [{ name: 'success', type: 'felt' }],
    passthrough: true,
    parentFunctionName: 'supports_interface',
  },

  name: {
    module: modules.ERC721,
    namespace: namespaces.ERC721,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
    ],
    returns: [{ name: 'name', type: 'felt' }],
    passthrough: true,
  },

  symbol: {
    module: modules.ERC721,
    namespace: namespaces.ERC721,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
    ],
    returns: [{ name: 'symbol', type: 'felt' }],
    passthrough: true,
  },

  balanceOf: {
    module: modules.ERC721,
    namespace: namespaces.ERC721,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'owner', type: 'felt' },
    ],
    returns: [{ name: 'balance', type: 'Uint256' }],
    passthrough: true,
    parentFunctionName: 'balance_of',
  },

  ownerOf: {
    module: modules.ERC721,
    namespace: namespaces.ERC721,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'token_id', type: 'Uint256' },
    ],
    returns: [{ name: 'owner', type: 'felt' }],
    passthrough: true,
    parentFunctionName: 'owner_of',
  },

  getApproved: {
    module: modules.ERC721,
    namespace: namespaces.ERC721,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'token_id', type: 'Uint256' },
    ],
    returns: [{ name: 'approved', type: 'felt' }],
    passthrough: true,
    parentFunctionName: 'get_approved',
  },

  isApprovedForAll: {
    module: modules.ERC721,
    namespace: namespaces.ERC721,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'owner', type: 'felt' },
      { name: 'operator', type: 'felt' },
    ],
    returns: [{ name: 'isApproved', type: 'felt' }],
    passthrough: true,
    parentFunctionName: 'is_approved_for_all',
  },

  tokenURI: {
    module: modules.ERC721,
    namespace: namespaces.ERC721,
    kind: 'view' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'tokenId', type: 'Uint256' },
    ],
    returns: [{ name: 'tokenURI', type: 'felt' }],
    passthrough: true,
    parentFunctionName: 'token_uri',
  },

  // --- external functions ---

  approve: {
    module: modules.ERC721,
    namespace: namespaces.ERC721,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'to', type: 'felt' },
      { name: 'tokenId', type: 'Uint256' },
    ],
  },

  setApprovalForAll: {
    module: modules.ERC721,
    namespace: namespaces.ERC721,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'operator', type: 'felt' },
      { name: 'approved', type: 'felt' },
    ],
    parentFunctionName: 'set_approval_for_all',
  },

  transferFrom: {
    module: modules.ERC721,
    namespace: namespaces.ERC721,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'from_', type: 'felt' },
      { name: 'to', type: 'felt' },
      { name: 'tokenId', type: 'Uint256' },
    ],
    parentFunctionName: 'transfer_from',
  },

  safeTransferFrom: {
    module: modules.ERC721,
    namespace: namespaces.ERC721,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'from_', type: 'felt' },
      { name: 'to', type: 'felt' },
      { name: 'tokenId', type: 'Uint256' },
      { name: 'data_len', type: 'felt' },
      { name: 'data', type: 'felt*' },
    ],
    parentFunctionName: 'safe_transfer_from',
  },

  safeMint: {
    module: modules.ERC721,
    namespace: namespaces.ERC721,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'to', type: 'felt' },
      { name: 'tokenId', type: 'Uint256' },
      { name: 'data_len', type: 'felt' },
      { name: 'data', type: 'felt*' },
      { name: 'tokenURI', type: 'felt' },
    ],
    parentFunctionName: '_safe_mint',
  },
  
  burn: {
    module: modules.ERC721,
    namespace: namespaces.ERC721,
    kind: 'external' as const,
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'tokenId', type: 'Uint256' },
    ],
  },

});