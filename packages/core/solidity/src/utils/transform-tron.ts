// Structured print profile that adapts generated Solidity output for the TRON
// ecosystem. It plugs into `printContract(contract, tronPrintProfile)` via the
// `transformName` / `transformImport` hooks, so it only ever rewrites
// OpenZeppelin library symbols and import paths — never user-supplied data
// (contract name, token name/symbol literals, securityContact). That's the key
// difference from a regex over rendered source, which can't tell them apart.
//
// `@openzeppelin/tron-contracts` mirrors `@openzeppelin/contracts` with two
// systematic differences, applied here structurally:
//
//   1. Path root: `@openzeppelin/contracts/...` -> `@openzeppelin/tron-contracts/...`
//      (and `-upgradeable/...` -> `tron-contracts-upgradeable/...`)
//   2. Token standards are renamed to the TRC family:
//        ERC20   -> TRC20,  ERC721  -> TRC721,
//        ERC1155 -> TRC1155, ERC4626 -> TRC4626   (incl. IERC* -> ITRC*)
//
// Every other identifier (ERC1363, ERC2981, ERC4337, ERC6909, EIP712, Ownable,
// AccessControl, etc.) is kept verbatim, matching how `@openzeppelin/tron-contracts`
// ships those files.

import type { Options } from '../options';
import type { ImportContract } from '../contract';
import SOLIDITY_VERSION from '../solidity-version.json';

// The maximum 0.8.x patch level that tron-solc currently supports. The mainline
// Wizard emits a higher version (tron-solc lags), so TRON caps to this; the TVM
// Democritus hardfork targets 0.8.26 + cancun. Bump when tron-solc catches up.
const TRON_SOLC_MAX_PATCH = 26;

// The `pragma solidity` version TRON emits and the version its toolchains
// compile with: the mainline Wizard version, capped at the tron-solc maximum.
// Hardhat/TronBox configs source their compiler version from this same constant.
export const TRON_SOLIDITY_VERSION = capTronSolidityVersion(SOLIDITY_VERSION);

function capTronSolidityVersion(version: string): string {
  const [major, minor, patch] = version.split('.').map(part => parseInt(part, 10));
  if (major === 0 && minor === 8 && Number.isInteger(patch)) {
    return `0.8.${Math.min(patch!, TRON_SOLC_MAX_PATCH)}`;
  }
  return version;
}

// TRON blocks are produced every 3 seconds (SR consensus), versus Ethereum's
// ~12s. Used wherever the Governor's `blockTime` would otherwise inherit the
// Solidity default of 12 (UI, CLI registry, and MCP tron-governor tool).
export const TRON_DEFAULT_BLOCK_TIME = 3;

// Renames an OpenZeppelin token-standard symbol to its TRC counterpart. Applied
// only to library symbol names and import paths (both free of user data).
function renameTronSymbol(name: string): string {
  return name.replace(/\bIERC(20|721|1155|4626)/g, 'ITRC$1').replace(/\bERC(20|721|1155|4626)/g, 'TRC$1');
}

function rewriteTronImportPath(path: string): string {
  // Rewrite the package root first (the `-upgradeable` root is matched before
  // the base root since it's a longer prefix), then rename token standards in
  // the directory and file names.
  return renameTronSymbol(
    path
      .replace(/^@openzeppelin\/contracts-upgradeable\//, '@openzeppelin/tron-contracts-upgradeable/')
      .replace(/^@openzeppelin\/contracts\//, '@openzeppelin/tron-contracts/'),
  );
}

/**
 * TRON library profile for `printContract`. Routes every surface (UI display,
 * zip generators, CLI, MCP) through one definition instead of post-processing
 * rendered text.
 */
export const tronPrintProfile: Options = {
  transformName: renameTronSymbol,
  transformImport: (parent: ImportContract): ImportContract => ({
    ...parent,
    name: renameTronSymbol(parent.name),
    path: rewriteTronImportPath(parent.path),
  }),
  solidityVersion: TRON_SOLIDITY_VERSION,
};

// `superchain` cross-chain bridging is OP Stack-specific: it pulls in
// `draft-ERC20Bridgeable` plus the hardcoded OP-Stack `0x42...0028` predeploy,
// neither of which exists on the TVM. The UI form hides the option, but the CLI
// and MCP surfaces reuse the full Solidity schemas, so they funnel options
// through this gate to downgrade `superchain` to `custom` before building.
// Mutates in place (to match the UI's `sanitizeOmittedFeatures` override
// contract) and returns the same object for ergonomic use at call sites.
type TronSanitizableOptions = { crossChainBridging?: false | 'custom' | 'erc7786native' | 'superchain' };

export function sanitizeTronOptions<T extends TronSanitizableOptions>(opts: T): T {
  if (opts.crossChainBridging === 'superchain') {
    opts.crossChainBridging = 'custom';
  }
  return opts;
}
