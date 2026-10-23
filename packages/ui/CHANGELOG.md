# Changelog


## 0.0.7 (2026-10-22)

- Stellar: Update Stellar Contracts to v0.8.0 and Soroban SDK to v28.0.0. ([#878](https://github.com/OpenZeppelin/contracts-wizard/pull/878))
  - Add `totalSupply` option to `fungible` and `stablecoin`, which tracks the total supply and exposes `total_supply`. Total supply tracking is opt-in since Stellar Contracts v0.8.0.
  - Add `cap` option to `fungible` and `stablecoin`, which sets a maximum total supply.
  - Add `royalties` and `defaultRoyaltyBasisPoints` options to `nonFungible`, which provide royalty information following ERC-2981.
  - Allow Votes with `stablecoin` limitations, and with Enumerable or Consecutive in `nonFungible`.
  - Reject a Governor voting period of 0, which the library rejects on deployment.
  - Warn in generated smart accounts against delegated signers that delegate their authentication back to the account.
  - Fix explicit trait implementations of Votes not exposing the Votes functions.
  - Fix pausable or explicitly implemented `stablecoin` burns skipping the allowlist and blocklist checks.
  - Fix the `stellar-non-fungible` MCP tool ignoring the `access` option.
  - **Breaking changes**:
    - Generated tokens declare their contract type with `Compose` and mint through it.
    - `fungible` and `stablecoin` no longer expose `total_supply` unless `totalSupply` or `cap` is set.
    - Stellar Contracts v0.8.0 moved the stored total supply out of instance storage. Do not upgrade a contract generated for v0.7.x directly to a `vault`, or to a `fungible` or `stablecoin` with `totalSupply` or `cap`: until the supply is migrated, it reads as 0, so a vault misprices its shares, minting can exceed the cap, and burns and redemptions fail. The new implementation must add an access-controlled migration that calls `migrate_total_supply` right after the upgrade, before the contract is used, as described in [Upgrades and Migrations](https://docs.openzeppelin.com/stellar-contracts/utils/upgradeable).
    - `nonFungible` with Consecutive renames `batch_mint` to `mint_range`, and sequential `mint` returns the minted token ID.

## 0.0.6 (2026-10-19)

- Add Chainlink CCIP bridging and ACE options for Solidity ERC20, Stablecoin, and RWA. Contracts generated with ACE use the BUSL-1.1 license. ([#880](https://github.com/OpenZeppelin/contracts-wizard/pull/880))

## 0.0.5 (2026-09-08)

- Cairo: Add ERC20FlashMint extension for the ERC20 token kind. ([#870](https://github.com/OpenZeppelin/contracts-wizard/pull/870))
  - Configurable max flash loan (default or custom cap), flash fee (percent of the loan amount or custom stub), and fee destination (burn or fee receiver).
  - Add `flashmint` options to the `cairo-erc20` MCP tool and CLI command.

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
