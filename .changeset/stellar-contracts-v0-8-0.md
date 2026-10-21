---
'@openzeppelin/wizard-stellar': minor
'@openzeppelin/wizard-common': patch
'@openzeppelin/contracts-mcp': minor
'ui': patch
---

Stellar: Update Stellar Contracts to v0.8.0 and Soroban SDK to v28.0.0.
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
  - `nonFungible` with Consecutive renames `batch_mint` to `mint_range`, and sequential `mint` returns the minted token ID.
