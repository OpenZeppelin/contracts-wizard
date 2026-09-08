# Changelog


## 0.0.4 (2026-09-01)

- Cairo: support OpenZeppelin Contracts for Cairo v4.0.1. ([#861](https://github.com/OpenZeppelin/contracts-wizard/pull/861))
  - Add ERC6909 contract kind ([#771](https://github.com/OpenZeppelin/contracts-wizard/pull/771))
  - Add ERC6909Metadata extension ([#793](https://github.com/OpenZeppelin/contracts-wizard/pull/793))
  - Add ERC6909ContentURI extension ([#793](https://github.com/OpenZeppelin/contracts-wizard/pull/793))
  - Add ERC6909TokenSupply extension ([#793](https://github.com/OpenZeppelin/contracts-wizard/pull/793))
  - Add ERC1155URIStorage extension ([#772](https://github.com/OpenZeppelin/contracts-wizard/pull/772))
  - Add ERC1155Supply extension ([#765](https://github.com/OpenZeppelin/contracts-wizard/pull/765))
  - Add ERC721URIStorage extension ([#772](https://github.com/OpenZeppelin/contracts-wizard/pull/772))
  - Add ERC721Wrapper extension ([#764](https://github.com/OpenZeppelin/contracts-wizard/pull/764))
  - Add ERC721Consecutive extension ([#800](https://github.com/OpenZeppelin/contracts-wizard/pull/800))
  - Add ERC20Wrapper extension ([#763](https://github.com/OpenZeppelin/contracts-wizard/pull/763))
  - **Breaking changes**:
    - Use OpenZeppelin Contracts for Cairo v4.0.1. ([#861](https://github.com/OpenZeppelin/contracts-wizard/pull/861))

## 0.0.3 (2026-08-07)

- Standardize crosschain terminology in user-facing text. ([#840](https://github.com/OpenZeppelin/contracts-wizard/pull/840))

## 0.0.2 (2026-08-07)

- Shrink MCP App package size by sharing one HTML template per language. ([#838](https://github.com/OpenZeppelin/contracts-wizard/pull/838))
  - Inject contract kind at serve time instead of shipping near-duplicate HTML per tool.
  - Scope MCP App Tailwind content away from web-only Wizard shells.
  - Bundle the Zama logo so it renders in self-contained MCP Apps.

## 0.0.1 (2026-08-05)

- Fix Governor Cross-Chain Execution appearing as an empty dropdown in the MCP App UI. ([#836](https://github.com/OpenZeppelin/contracts-wizard/pull/836))
