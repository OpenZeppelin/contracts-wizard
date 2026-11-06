---
name: stellar-release-update
description: >
  Update contracts-wizard to a new stellar-contracts release. Use when the user mentions a new
  Stellar release, bumping the Stellar contracts version in the wizard, or syncing the wizard
  with stellar-contracts.
---

# Stellar Release Update

The wizard generates Rust code that depends on the stellar-contracts crates, so each release needs a version bump here plus code-generation changes for any API changes.

Ask for: the stellar-contracts checkout path, the new tag, and the previous tag.

Work on branch `wizard/stellar-v<X.Y.Z>`. Merge only after the crates are on crates.io, because CI compiles against them.

## 1. Analyze upstream changes

Run `git -C <stellar-contracts> diff <prev>..<new> --stat` and look for:
- **New crates**: does one warrant a new wizard tab? (`governance` did; `access`, a helper, did not.)
- **Trait changes**: the wizard generates `impl Trait for Contract` blocks, so renamed, added or re-signed methods must be reflected.
- **`storage::` signature changes**: the generated code calls these functions directly.
- **New options** users may want to toggle (e.g. `votes` on tokens).

Grep `packages/core/stellar/src/` for each affected name. Present this analysis and the update plan, and wait for confirmation before changing anything.

## 2. Bump versions

In `packages/core/stellar/src/utils/version.ts`, set `contractsVersion`, `compatibleContractsSemver` and `compatibleSorobanVersion` (take the soroban-sdk version from the stellar-contracts root `Cargo.toml`).

## 3. Update code generation

Update the builders' `defineFunctions()` calls (see Key files), using `stellar-contracts/examples/` as the reference for how each API is meant to be used. For a new option or contract type, also update:
- the AI function definitions and descriptions
- `languages.ts` (`LanguagesContractsOptions`)
- UI controls (`packages/ui/src/stellar/<Name>Controls.svelte`, wired into `App.svelte`)
- compile tests for the new combinations

## 4. Check

```bash
yarn lint && yarn type:check:api                                    # repo root
cd packages/core/stellar
npx ava --update-snapshots                                   # after the crates are on crates.io
STELLAR_CONTRACTS_PATH=<checkout> npx ava --update-snapshots # before: compile tests use the local checkout
```

The compile tests pin the crates at `=<version>`, so without `STELLAR_CONTRACTS_PATH` they fail until the release is published. They take minutes. Running `--update-snapshots` with a `--match` that excludes them deletes their snapshots; restore those with `git checkout`. If the UI reports stale types, run `npm run prepare` in `packages/core/stellar` first.

## 5. Add a changeset

`.changeset/<name>.md` with `'@openzeppelin/wizard-stellar': minor` and "Update Stellar contracts to vX.Y.Z and soroban-sdk to A.B.C". Check with `npx changeset status --since=origin/master`.

## Key files

| Path                                                                     | Purpose                                  |
| ------------------------------------------------------------------------ | ---------------------------------------- |
| `packages/core/stellar/src/utils/version.ts`                             | Versions                                 |
| `packages/core/stellar/src/{fungible,non-fungible,stablecoin,governor,vault,account}.ts` | Builders, one per contract type |
| `packages/core/stellar/src/{set-access-control,add-upgradeable,add-pausable,add-votes}.ts` | Shared modules              |
| `packages/core/stellar/src/zip-shared.ts`                                | Generated `Cargo.toml` and dependencies  |
| `packages/core/stellar/src/build-generic.ts`                             | `KindedOptions` union                    |
| `packages/ui/api/ai-assistant/function-definitions/stellar.ts`           | AI function definitions                  |
| `packages/common/src/ai/descriptions/stellar.ts`                         | AI option descriptions                   |
| `packages/ui/api/ai-assistant/types/languages.ts`                        | Language/contract type mappings          |
