// Structured print profile that adapts generated Solidity output for the TRON
// ecosystem. It plugs into `printContract(contract, tronPrintProfile)` via the
// `transformName` / `transformImport` hooks, so it only ever rewrites
// OpenZeppelin library symbols and import paths — never user-supplied data
// (contract name, token name/symbol literals, securityContact).
//
// `@openzeppelin/tron-contracts` mirrors `@openzeppelin/contracts` with two
// systematic differences, applied here structurally:
//
//   1. Path root: `@openzeppelin/contracts/...` -> `@openzeppelin/tron-contracts/...`
//      (and `-upgradeable/...` -> `tron-contracts-upgradeable/...`)
//   2. Standards are renamed to the TRON family: ERC -> TRC, IERC -> ITRC,
//      EIP -> TIP (e.g. ERC20 -> TRC20, ERC1363 -> TRC1363, EIP712 -> TIP712).
//      tron-contracts adopts every standard as a TRC, so this is a blanket
//      prefix swap.
//
// Non-standard identifiers (Ownable, AccessControl, etc.) stay verbatim. The
// rename is case-sensitive and only touches symbols/imports. Namespaced storage
// annotations keep `erc7201:` to match `@openzeppelin/tron-contracts-upgradeable`
// (same slot formula as TIP-7201; the formula id is only the NatSpec label).

import type { Options } from '../options';
import type { ImportContract } from '../contract';
import type { Kind } from '../kind';
import SOLIDITY_VERSION from '../solidity-version.json';

// The maximum 0.8.x patch level that tron-solc currently supports. The mainline
// Wizard emits a higher version (tron-solc lags), so TRON caps to this; the TVM
// Democritus hardfork targets 0.8.26 + cancun. Bump when tron-solc catches up.
const TRON_SOLC_MAX_PATCH = 26;

// The `pragma solidity` version TRON emits and the version its toolchains
// compile with: the mainline Wizard version, capped at the tron-solc maximum.
// Hardhat/TronBox configs source their compiler version from this same constant.
export const TRON_SOLIDITY_VERSION = capTronSolidityVersion(SOLIDITY_VERSION);

/** Published `@openzeppelin/tron-contracts` / `-upgradeable` version the Wizard targets. */
export const TRON_CONTRACTS_VERSION = '5.6.0';
/** Semver range shown in compatibility checks and generated contract banners. */
export const compatibleTronContractsSemver = '^5.6.0';

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

// Renames an OpenZeppelin standard symbol to its TRON counterpart (see file
// header): ERC->TRC, IERC->ITRC, EIP->TIP. Case-sensitive and applied only to
// library symbols and import paths, never user data or lowercase annotations.
function renameTronSymbol(name: string): string {
  return name
    .replace(/\bIERC(\d+)/g, 'ITRC$1')
    .replace(/\bERC(\d+)/g, 'TRC$1')
    .replace(/\bEIP(\d+)/g, 'TIP$1');
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
 * zip generators, CLI, MCP) through one definition.
 */
export const tronPrintProfile: Options = {
  transformName: renameTronSymbol,
  transformImport: (parent: ImportContract): ImportContract => ({
    ...parent,
    name: renameTronSymbol(parent.name),
    path: rewriteTronImportPath(parent.path),
  }),
  solidityVersion: TRON_SOLIDITY_VERSION,
  additionalCompatibleLibraries: [
    {
      name: 'OpenZeppelin TRON Contracts',
      path: '@openzeppelin/tron-contracts',
      version: compatibleTronContractsSemver,
    },
  ],
};

// `superchain` cross-chain bridging is OP Stack-specific: it pulls in
// `draft-ERC20Bridgeable` plus the hardcoded OP-Stack `0x42...0028` predeploy,
// neither of which exists on the TVM. The UI form hides the option, but the CLI
// and MCP surfaces reuse the full Solidity schemas, so they funnel options
// through this gate to downgrade `superchain` to `custom` before building.
// Mutates in place (to match the UI's `sanitizeOmittedFeatures` override
// contract) and returns the same object for ergonomic use at call sites.
type TronSanitizableOptions = {
  kind?: Kind;
  crossChainBridging?: false | 'custom' | 'erc7786native' | 'superchain';
  crossChainExecution?: boolean;
};

export function sanitizeTronOptions<T extends TronSanitizableOptions>(opts: T): T {
  // TRON Contracts 5.6 has TRC20Crosschain but not TRC721/TRC1155Crosschain.
  if (opts.kind === 'ERC721' || opts.kind === 'ERC1155') {
    if (opts.crossChainBridging) {
      opts.crossChainBridging = false;
    }
  } else if (opts.crossChainBridging === 'superchain') {
    opts.crossChainBridging = 'custom';
  }
  // GovernorCrosschain is a Contracts 5.7 API not present in TRON 5.6.
  if (opts.crossChainExecution) {
    opts.crossChainExecution = false;
  }
  return opts;
}
