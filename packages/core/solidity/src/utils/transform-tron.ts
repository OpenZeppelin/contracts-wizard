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

const PATH_ROOT_PATTERN = /@openzeppelin\/contracts\//g;
const TOKEN_ERC20_DIR_PATTERN = /\/token\/ERC20\//g;
const TOKEN_ERC721_DIR_PATTERN = /\/token\/ERC721\//g;
const TOKEN_ERC1155_DIR_PATTERN = /\/token\/ERC1155\//g;
const INTERFACE_PATTERN = /\bIERC(20|721|1155|4626)/g;
const SYMBOL_PATTERN = /\bERC(20|721|1155|4626)/g;
const PRAGMA_PATTERN = /(pragma\s+solidity\s+\^0\.8\.)(\d+)(\s*;)/g;

export function rewriteForTron(source: string): string {
  return source
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
