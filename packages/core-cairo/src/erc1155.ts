import { Contract, ContractBuilder } from './contract';
import { Access, requireAccessControl, setAccessControl } from './set-access-control';
import { addPausable, setPausable } from './add-pausable';
import { defineFunctions } from './utils/define-functions';
import { CommonOptions, withCommonDefaults, withImplicitArgs } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { defineModules } from './utils/define-modules';
import { defaults as commonDefaults } from './common-options';
import { printContract } from './print';
import { importUint256 } from './utils/uint256';
import { addSupportsInterface, importGetCallerAddress } from './common-functions';

export const defaults: Required<ERC1155Options> = {
  uri: '',
  burnable: false,
  pausable: false,
  mintable: false,
  updatableUri: true,
  access: commonDefaults.access,
  upgradeable: commonDefaults.upgradeable,
  info: commonDefaults.info
} as const;

export function printERC1155(opts: ERC1155Options = defaults): string {
  return printContract(buildERC1155(opts));
}

export interface ERC1155Options extends CommonOptions {
  uri: string;
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
  updatableUri?: boolean;
}

function withDefaults(opts: ERC1155Options): Required<ERC1155Options> {
  return {
    ...opts,
    ...withCommonDefaults(opts),
    burnable: opts.burnable ?? defaults.burnable,
    pausable: opts.pausable ?? defaults.pausable,
    mintable: opts.mintable ?? defaults.mintable,
    updatableUri: opts.updatableUri ?? defaults.updatableUri,
  };
}

export function isAccessControlRequired(opts: Partial<ERC1155Options>): boolean {
  return opts.mintable || opts.pausable || opts.updatableUri !== false;
}

export function buildERC1155(opts: ERC1155Options): Contract {
  const c = new ContractBuilder();

  const allOpts = withDefaults(opts);

  addBase(c, allOpts.uri);
  addSupportsInterface(c);

  c.addFunction(functions.uri);
  c.addFunction(functions.balanceOf);
  c.addFunction(functions.balanceOfBatch);
  c.addFunction(functions.isApprovedForAll);

  if (allOpts.updatableUri) {
    addSetUri(c, allOpts.access);
  }

  c.addFunction(functions.setApprovalForAll);
  c.addFunction(functions.safeTransferFrom);
  c.addFunction(functions.safeBatchTransferFrom);

  importUint256(c);

  if (allOpts.pausable) {
    addPausable(c, allOpts.access, [
      functions.setApprovalForAll,
      functions.safeTransferFrom, 
      functions.safeBatchTransferFrom, 
    ]);
    if (allOpts.burnable) {
      setPausable(c, functions.burn);
      setPausable(c, functions.burnBatch);
    }
    if (allOpts.mintable) {
      setPausable(c, functions.mint);
      setPausable(c, functions.mintBatch);
    }
  }

  if (allOpts.burnable) {
    addBurnable(c);
  }

  if (allOpts.mintable) {
    addMintable(c, allOpts.access);
  }

  setAccessControl(c, allOpts.access);
  setUpgradeable(c, allOpts.upgradeable);

  setInfo(c, allOpts.info);

  return c;
}

function addBase(c: ContractBuilder, uri: string) {
  c.addModule(
    modules.ERC1155,
    [uri],
    [
      functions.safeTransferFrom, 
      functions.safeBatchTransferFrom, 
    ],
    true,
  );
}

function addBurnable(c: ContractBuilder) {
  c.addFunction(functions.burn);
  c.setFunctionBody(
    [
      'ERC1155.assert_owner_or_approved(owner=from_)',
      'ERC1155._burn(from_, id, value)'
    ],
    functions.burn
  );

  c.addFunction(functions.burnBatch);
  c.setFunctionBody(
    [
      'ERC1155.assert_owner_or_approved(owner=from_)',
      'ERC1155._burn_batch(from_, ids_len, ids, values_len, values)'
    ],
    functions.burnBatch
  );
}

function addMintable(c: ContractBuilder, access: Access) {
  requireAccessControl(c, functions.mint, access, 'MINTER');
  requireAccessControl(c, functions.mintBatch, access, 'MINTER');

  c.setFunctionBody(
    [
      'ERC1155._mint(to, id, value, data_len, data)'
    ],
    functions.mint
  );

  c.setFunctionBody(
    [
      'ERC1155._mint_batch(to, ids_len, ids, values_len, values, data_len, data)'
    ],
    functions.mintBatch
  );
}

function addSetUri(c: ContractBuilder, access: Access) {
  c.addFunction(functions.setURI);
  requireAccessControl(c, functions.setURI, access, 'URI_SETTER');
}

const modules = defineModules( {
  ERC1155: {
    path: 'openzeppelin.token.erc1155.library',
    useNamespace: true
  },

  math: {
    path: 'starkware.cairo.common.math',
    useNamespace: false
  }
});

const functions = defineFunctions({

  // --- view functions ---

  uri: {
    module: modules.ERC1155,
    kind: 'view',
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'id', type: 'Uint256' },
    ],
    returns: [{ name: 'uri', type: 'felt' }],
    passthrough: true,
  },

  balanceOf: {
    module: modules.ERC1155,
    kind: 'view',
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'account', type: 'felt' },
      { name: 'id', type: 'Uint256' },
    ],
    returns: [{ name: 'balance', type: 'Uint256' }],
    passthrough: true,
    parentFunctionName: 'balance_of',
  },

  balanceOfBatch: {
    module: modules.ERC1155,
    kind: 'view',
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'accounts_len', type: 'felt' },
      { name: 'accounts', type: 'felt*' },
      { name: 'ids_len', type: 'felt' },
      { name: 'ids', type: 'Uint256*' },
    ],
    returns: [
      { name: 'balances_len', type: 'felt' },
      { name: 'balances', type: 'Uint256*' }],
    passthrough: true,
    parentFunctionName: 'balance_of_batch',
  },

  isApprovedForAll: {
    module: modules.ERC1155,
    kind: 'view',
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'account', type: 'felt' },
      { name: 'operator', type: 'felt' },
    ],
    returns: [{ name: 'approved', type: 'felt' }],
    passthrough: true,
    parentFunctionName: 'is_approved_for_all',
  },

  // --- external functions ---

  setURI: {
    module: modules.ERC1155,
    kind: 'external',
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'uri', type: 'felt' },
    ],
    parentFunctionName: '_set_uri',
  },

  setApprovalForAll: {
    module: modules.ERC1155,
    kind: 'external',
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'operator', type: 'felt' },
      { name: 'approved', type: 'felt' },
    ],
    parentFunctionName: 'set_approval_for_all',
  },

  safeTransferFrom: {
    module: modules.ERC1155,
    kind: 'external',
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'from_', type: 'felt' },
      { name: 'to', type: 'felt' },
      { name: 'id', type: 'Uint256' },
      { name: 'value', type: 'Uint256' },
      { name: 'data_len', type: 'felt' },
      { name: 'data', type: 'felt*' },
    ],
    parentFunctionName: 'safe_transfer_from',
  },

  safeBatchTransferFrom: {
    module: modules.ERC1155,
    kind: 'external',
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'from_', type: 'felt' },
      { name: 'to', type: 'felt' },
      { name: 'ids_len', type: 'felt' },
      { name: 'ids', type: 'Uint256*' },
      { name: 'values_len', type: 'felt' },
      { name: 'values', type: 'Uint256*' },
      { name: 'data_len', type: 'felt' },
      { name: 'data', type: 'felt*' },
    ],
    parentFunctionName: 'safe_batch_transfer_from',
  },

  mint: {
    module: modules.ERC1155,
    kind: 'external',
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'to', type: 'felt' },
      { name: 'id', type: 'Uint256' },
      { name: 'value', type: 'Uint256' },
      { name: 'data_len', type: 'felt' },
      { name: 'data', type: 'felt*' },
    ],
    parentFunctionName: '_mint',
  },
  
  mintBatch: {
    module: modules.ERC1155,
    kind: 'external',
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'to', type: 'felt' },
      { name: 'ids_len', type: 'felt' },
      { name: 'ids', type: 'Uint256*' },
      { name: 'values_len', type: 'felt' },
      { name: 'values', type: 'Uint256*' },
      { name: 'data_len', type: 'felt' },
      { name: 'data', type: 'felt*' },
    ],
    parentFunctionName: '_mint_batch',
  },

  burn: {
    module: modules.ERC1155,
    kind: 'external',
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'from_', type: 'felt' },
      { name: 'id', type: 'Uint256' },
      { name: 'value', type: 'Uint256' },
    ],
    parentFunctionName: '_burn',
  },

  burnBatch: {
    module: modules.ERC1155,
    kind: 'external',
    implicitArgs: withImplicitArgs(),
    args: [
      { name: 'from_', type: 'felt' },
      { name: 'ids_len', type: 'felt' },
      { name: 'ids', type: 'Uint256*' },
      { name: 'values_len', type: 'felt' },
      { name: 'values', type: 'Uint256*' },
    ],
    parentFunctionName: '_burn_batch',
  },

});