import type { Contract } from './contract';
import { ContractBuilder } from './contract';
import type { Access } from './set-access-control';
import { setAccessControl, requireAccessControl } from './set-access-control';
import { addPauseFunctions } from './add-pausable';
import { supportsInterface } from './common-functions';
import { defineFunctions } from './utils/define-functions';
import type { CommonOptions } from './common-options';
import { withCommonDefaults, defaults as commonDefaults } from './common-options';
import { setUpgradeable } from './set-upgradeable';
import { setInfo } from './set-info';
import { printContract } from './print';

export const crossChainBridgingOptions = [false, 'erc7786native'] as const;
export type CrossChainBridging = (typeof crossChainBridgingOptions)[number];

export interface ERC1155Options extends CommonOptions {
  name: string;
  uri: string;
  burnable?: boolean;
  pausable?: boolean;
  mintable?: boolean;
  supply?: boolean;
  updatableUri?: boolean;
  crossChainBridging?: CrossChainBridging;
  crossChainLinkAllowOverride?: boolean;
}

export const defaults: Required<ERC1155Options> = {
  ...commonDefaults,
  name: 'MyToken',
  uri: '',
  burnable: false,
  pausable: false,
  mintable: false,
  supply: false,
  updatableUri: true,
  crossChainBridging: false,
  crossChainLinkAllowOverride: false,
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
    crossChainBridging: opts.crossChainBridging ?? defaults.crossChainBridging,
    crossChainLinkAllowOverride: opts.crossChainLinkAllowOverride ?? defaults.crossChainLinkAllowOverride,
  };
}

export function printERC1155(opts: ERC1155Options = defaults): string {
  return printContract(buildERC1155(opts));
}

export function isAccessControlRequired(opts: Partial<ERC1155Options>): boolean {
  return (
    opts.mintable ||
    opts.pausable ||
    opts.updatableUri !== false ||
    opts.upgradeable === 'uups' ||
    opts.crossChainBridging === 'erc7786native'
  );
}

export function buildERC1155(opts: ERC1155Options): Contract {
  const allOpts = withDefaults(opts);

  const c = new ContractBuilder(allOpts.name);

  const { access, upgradeable, info } = allOpts;

  addBase(c, allOpts.uri);

  if (allOpts.crossChainBridging) {
    addCrossChainBridging(c, allOpts.crossChainBridging, allOpts.crossChainLinkAllowOverride, access);
  }

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

function addCrossChainBridging(
  c: ContractBuilder,
  crossChainBridging: 'erc7786native',
  crossChainLinkAllowOverride: boolean,
  access: Access,
) {
  switch (crossChainBridging) {
    case 'erc7786native':
      addERC1155Crosschain(c, crossChainLinkAllowOverride, access);
      break;
    default: {
      const _: never = crossChainBridging;
      throw new Error('Unknown value for `crossChainBridging`');
    }
  }
}

function addERC1155Crosschain(c: ContractBuilder, crossChainLinkAllowOverride: boolean, access: Access) {
  c.addParent({
    name: 'ERC1155Crosschain',
    path: '@openzeppelin/contracts/token/ERC1155/extensions/ERC1155Crosschain.sol',
  });

  c.addConstructionOnly(
    {
      name: 'CrosschainLinked',
      path: '@openzeppelin/contracts/crosschain/CrosschainLinked.sol',
    },
    [{ lit: 'links' }],
  );
  c.addConstructorArgument({ type: { name: 'CrosschainLinked.Link[] memory' }, name: 'links' });

  requireAccessControl(c, functions.setLink, access, 'CROSSCHAIN_LINKER', 'crosschainLinker');
  c.addFunctionCode(`_setLink(gateway, counterpart, ${crossChainLinkAllowOverride});`, functions.setLink);
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
    args: [{ name: 'newuri', type: 'string memory' }],
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

  setLink: {
    kind: 'public' as const,
    args: [
      { name: 'gateway', type: 'address' },
      { name: 'counterpart', type: 'bytes memory' },
    ],
  },
});
