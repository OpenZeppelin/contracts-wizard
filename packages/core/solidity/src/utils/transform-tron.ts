// Post-process rewriter that adapts generated Solidity output for the
// TRON ecosystem.
//
// `@openzeppelin/tron-contracts` mirrors `@openzeppelin/contracts` with two
// systematic differences:
//
//   1. Path root: `@openzeppelin/contracts/...` -> `@openzeppelin/tron-contracts/...`
//   2. Token standards are renamed to the TRC family:
//        ERC20    -> TRC20    (dir `token/ERC20/`   -> `token/TRC20/`)
//        ERC721   -> TRC721   (dir `token/ERC721/`  -> `token/TRC721/`)
//        ERC1155  -> TRC1155  (dir `token/ERC1155/` -> `token/TRC1155/`)
//        ERC4626  -> TRC4626  (lives under `token/TRC20/extensions/`)
//
// Every other identifier (ERC1363, ERC2981, ERC4337, ERC6909, EIP712,
// Ownable, AccessControl, etc.) is kept verbatim, matching how
// `@openzeppelin/tron-contracts` ships those files.
//
// We also cap the `pragma solidity` version at the maximum that `tron-solc`
// supports. The mainline Wizard currently emits ^0.8.27, which tron-solc
// does not yet ship; the TVM Democritus hardfork targets 0.8.26 + cancun.

// The maximum 0.8.x minor that tron-solc currently supports.
// Bump this when tron-solc catches up to the mainline Wizard's Solidity version.
const TRON_SOLC_MAX_MINOR = 26;

// TRON blocks are produced every 3 seconds (SR consensus), versus Ethereum's
// ~12s. Used wherever the Governor's `blockTime` would otherwise inherit the
// Solidity default of 12 (UI, CLI registry, and MCP tron-governor tool).
export const TRON_DEFAULT_BLOCK_TIME = 3;

// Upgradeable contracts import their transpiled (`*Upgradeable`) parents from
// `@openzeppelin/contracts-upgradeable`, while stateless proxy utilities
// (`Initializable`, `UUPSUpgradeable`) and interfaces still come from the base
// `@openzeppelin/contracts`. The TRON ecosystem mirrors that split:
// `@openzeppelin/tron-contracts-upgradeable` (the upgradeable build) plus
// `@openzeppelin/tron-contracts` as its peer. This pattern must run before the
// base-package pattern below so the longer `-upgradeable` root is matched first.
const UPGRADEABLE_PATH_ROOT_PATTERN = /@openzeppelin\/contracts-upgradeable\//g;
const PATH_ROOT_PATTERN = /@openzeppelin\/contracts\//g;
const TOKEN_ERC20_DIR_PATTERN = /\/token\/ERC20\//g;
const TOKEN_ERC721_DIR_PATTERN = /\/token\/ERC721\//g;
const TOKEN_ERC1155_DIR_PATTERN = /\/token\/ERC1155\//g;
const INTERFACE_PATTERN = /\bIERC(20|721|1155|4626)/g;
const SYMBOL_PATTERN = /\bERC(20|721|1155|4626)/g;
const PRAGMA_PATTERN = /(pragma\s+solidity\s+\^0\.8\.)(\d+)(\s*;)/g;

// `superchain` cross-chain bridging is OP Stack-specific: it pulls in
// `draft-ERC20Bridgeable` plus the hardcoded OP-Stack `0x42...0028` predeploy,
// neither of which exists on the TVM. The UI form hides the option, but the CLI
// and MCP surfaces reuse the full Solidity schemas, so they funnel options
// through this gate to downgrade `superchain` to `custom` before printing.
// Mutates in place (to match the UI's `sanitizeOmittedFeatures` override
// contract) and returns the same object for ergonomic use at call sites.
type TronSanitizableOptions = { crossChainBridging?: false | 'custom' | 'erc7786native' | 'superchain' };

export function sanitizeTronOptions<T extends TronSanitizableOptions>(opts: T): T {
  if (opts.crossChainBridging === 'superchain') {
    opts.crossChainBridging = 'custom';
  }
  return opts;
}

export function rewriteForTron(source: string): string {
  return source
    .replace(UPGRADEABLE_PATH_ROOT_PATTERN, '@openzeppelin/tron-contracts-upgradeable/')
    .replace(PATH_ROOT_PATTERN, '@openzeppelin/tron-contracts/')
    .replace(TOKEN_ERC20_DIR_PATTERN, '/token/TRC20/')
    .replace(TOKEN_ERC721_DIR_PATTERN, '/token/TRC721/')
    .replace(TOKEN_ERC1155_DIR_PATTERN, '/token/TRC1155/')
    .replace(INTERFACE_PATTERN, 'ITRC$1')
    .replace(SYMBOL_PATTERN, 'TRC$1')
    .replace(PRAGMA_PATTERN, (_match, prefix, minor, suffix) => {
      const capped = Math.min(parseInt(minor, 10), TRON_SOLC_MAX_MINOR);
      return `${prefix}${capped}${suffix}`;
    });
}
