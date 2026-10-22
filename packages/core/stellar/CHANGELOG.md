# Changelog


## 0.7.0 (2026-10-22)

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

## 0.6.5 (2026-09-08)

- Improve performance of premint amount parsing. ([#872](https://github.com/OpenZeppelin/contracts-wizard/pull/872))

## 0.6.4 (2026-08-17)

- Add Stellar `Account` contract type, a smart account combining Delegated, Ed25519 and WebAuthn (passkey) signers with an optional simple or weighted threshold policy, and support for execution entry point and upgradeable options. ([#826](https://github.com/OpenZeppelin/contracts-wizard/pull/826))

## 0.6.3 (2026-06-26)

- Add Stellar tokenized `Vault` contract type, a Fungible Token that issues shares for an underlying asset (ERC-4626-style), with support for pausable, upgradeable, and access control options. ([#821](https://github.com/OpenZeppelin/contracts-wizard/pull/821))

## 0.6.2 (2026-06-18)

- Reject line terminators in `info.securityContact` and `info.license` to prevent breaking out of the generated comment lines. Fixes [GHSA-9wxg-vf3r-56hc](https://github.com/OpenZeppelin/contracts-wizard/security/advisories/GHSA-9wxg-vf3r-56hc). ([#818](https://github.com/OpenZeppelin/contracts-wizard/pull/818))

## 0.6.1 (2026-06-11)

- Update Stellar Contracts to v0.7.2 and Soroban SDK to v26.1.0. ([#815](https://github.com/OpenZeppelin/contracts-wizard/pull/815))
- Add optional `decimals` to `fungible` and `stablecoin`, which sets the token's metadata decimals. Defaults to 7 as before. ([#812](https://github.com/OpenZeppelin/contracts-wizard/pull/812))

## 0.6.0 (2026-04-22)

- Add Governor ([#788](https://github.com/OpenZeppelin/contracts-wizard/pull/788))
- Add Upgradeable feature to Governor, requiring Access Control (Ownable or Roles)
- Add Timelock feature to Governor, integrating a timelock contract for delayed proposal execution
- Refactor contracts to match the latest v0.7.1

## 0.5.0 (2026-01-29)

- Refactor Stellar contracts to match the latest v0.6.0 ([#768](https://github.com/OpenZeppelin/contracts-wizard/pull/768))
  - **Breaking changes**:
    - Use OpenZeppelin Stellar Soroban Contracts v0.6.0
    - Use `MuxedAddress` for fungible transfer function
    - Change order of parameters in access control
    - Change default fungible decimals to 7

## 0.4.5 (2026-01-14)

- Stellar: add an explicitImplementations flag that switches from using default_impl macro to explicit definitions ([#728](https://github.com/OpenZeppelin/contracts-wizard/pull/728))

## 0.4.4 (2025-11-26)

- Add tokenUri setting for stellar non fungible model ([#725](https://github.com/OpenZeppelin/contracts-wizard/pull/725))

## 0.4.3 (2025-10-14)

- Set security contact as contract metadata ([#679](https://github.com/OpenZeppelin/contracts-wizard/pull/679))

## 0.4.2 (2025-07-25)

- Fix access control dependency import to import from `stellar_access` instead of `stellar_contract_utils` ([#608](https://github.com/OpenZeppelin/contracts-wizard/pull/608))

## 0.4.1 (2025-07-22)

- Dependencies from crates.io and remove unused imports ([#602](https://github.com/OpenZeppelin/contracts-wizard/pull/602))
  - **Breaking changes**:
    - Use OpenZeppelin Stellar Soroban Contracts v0.4.1

## 0.3.0 (2025-07-03)

- Add Stablecoin with Limitations and Access Control (ownable and roles). ([#575](https://github.com/OpenZeppelin/contracts-wizard/pull/575))
  - **Breaking changes**:
    - Use OpenZeppelin Stellar Soroban Contracts v0.3.0

## 0.2.3 (2025-06-27)

- Add security contact in contract info ([#563](https://github.com/OpenZeppelin/contracts-wizard/pull/563))

## 0.2.2 (2025-06-20)

- Add support for Wizard MCP server. ([#569](https://github.com/OpenZeppelin/contracts-wizard/pull/569))

## 0.2.1 (2025-06-10)

- Fix missing `ContractOverrides` import and rename `defaultimpl` to `default_impl`. ([#566](https://github.com/OpenZeppelin/contracts-wizard/pull/566))

## 0.2.0 (2025-05-13)

- Add NonFungible extension and minor refactorings to Fungible (crate renamings, etc.). ([#531](https://github.com/OpenZeppelin/contracts-wizard/pull/531))
- **Breaking changes:**
  - Use OpenZeppelin Stellar Soroban Contracts v0.2.0

## 0.1.1 (2025-03-03)

- Add a default no_std to all contracts. ([#471](https://github.com/OpenZeppelin/contracts-wizard/pull/471))

## 0.1.0 (2025-02-25)

- Initial version. ([#460](https://github.com/OpenZeppelin/contracts-wizard/pull/460))
