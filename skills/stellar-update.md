# Skill: Sync Stellar Contracts into Contract Wizard

## Purpose
When a new release of `stellar-contracts` is published, this skill guides the process of inspecting what changed and updating the corresponding code in `contracts-wizard` under `packages/core/stellar`.

---

## Inputs Required

Before starting, collect the following from the user:

| Input                 | Description                                                  |
| --------------------- | ------------------------------------------------------------ |
| `CONTRACTS_REPO_PATH` | Absolute path to the local `contracts-wizard` repository     |
| `NEW_TAG`             | Tag or commit SHA of the new `stellar-contracts` release     |
| `OLD_TAG`             | Tag or commit SHA of the previous release to compare against |

---

## Step 1 — Inspect the Wizard's Current Stellar Code

Navigate to `/packages/core/stellar` and get the full picture of what contracts and traits are currently implemented. This will help you understand the scope of the update and identify which parts of the Wizard codebase are relevant.

---

## Step 2 — Diff the Two Releases of `stellar-contracts`

Run the following to get the full diff between the two releases:

```bash
cd {CONTRACTS_REPO_PATH}
git diff {OLD_TAG}..{NEW_TAG}
```

Also get a high-level summary of what changed:

```bash
git log {OLD_TAG}..{NEW_TAG} --oneline
git diff {OLD_TAG}..{NEW_TAG} --stat
```

Organize findings into these categories:

### 2a. New Crates / Packages
For each new crate introduced:
- Does it represent a standalone, user-facing contract? (e.g., a token, an NFT, a governance contract)
- Or is it a helper/utility used internally by other contracts? (e.g., an `access` or `storage` helper)
- **Decision rule:** Only surface it in the Wizard UI if it makes sense as a contract on its own that a user would want to deploy or configure.

### 2b. Changes to Existing Packages
For each modified package:
- Were any **public traits** changed? (added/removed methods, changed signatures) → **High priority**
- Were any **public function signatures** changed? → **High priority**
- Were changes internal only (e.g., storage layout, private helpers)? → Likely low impact, but verify
- Cross-reference: is this package currently used anywhere in `packages/core/stellar`? If yes, the change **must** be applied.

### 2c. Breaking Changes
Flag any change that:
- Removes or renames a public function or trait method
- Changes a function's parameter types or return type
- Changes the expected behavior of an interface the Wizard currently generates code for

Breaking changes require the most careful handling — trace every usage in the Wizard code before updating.

### 2d. Removed Crates / Deprecated APIs
- Check if anything the Wizard currently references has been removed or deprecated
- These must be updated or removed from the Wizard output accordingly

---

## Step 3 — Plan the Updates

Produce a structured update plan before touching any code:

```
[ ] New contract to add:       <crate name> → new tab/section "<Name>"
[ ] Trait change:              <trait> in <crate> → update generator in <wizard file>
[ ] Signature change:          <fn> in <crate> → update call site in <wizard file>
[ ] Internal-only change:      <crate> → no Wizard change needed (reason: ...)
[ ] Breaking change:           <what changed> → impacts <wizard file(s)>, update plan: ...
[ ] Removed/deprecated:        <symbol> → remove/replace in <wizard file>
```

---

## Step 4 — Apply the Updates

### If adding a new contract:
1. Add a new tab or section in the relevant Wizard UI component
2. Define the options/configuration the user can set (mirroring the crate's constructor or init parameters)
3. Implement the code generation logic in `packages/core/stellar` to produce the correct Stellar contract code
4. Ensure the generated code uses the correct imports from the new crate

### If updating an existing contract:
1. Locate all files in `packages/core/stellar` that reference the changed crate
2. Apply trait/signature changes precisely — do not approximate
3. If a parameter was added, decide on a sensible default or expose it as a new Wizard option
4. If a parameter was removed, clean up any Wizard options or generated code that set it

### If a crate was removed or deprecated:
1. Remove or replace references in the Wizard's code generator
2. If the functionality was merged into another crate, re-map accordingly

---

## Step 5 — Verify

- Run through each contract type the Wizard supports and confirm the generated output matches the new `stellar-contracts` API
- Pay particular attention to trait implementations — these are the most likely source of subtle breakage
- Confirm no old import paths, removed functions, or stale signatures remain in the generated code

---

## Key Heuristics

| Situation                                    | Action                                               |
| -------------------------------------------- | ---------------------------------------------------- |
| New crate is a helper/utility                | Skip — don't expose in Wizard                        |
| New crate is a deployable contract           | Add UI tab + code generator                          |
| Changed function is not referenced in Wizard | Note it, no code change needed                       |
| Changed function **is** referenced in Wizard | Must update, no exceptions                           |
| Trait method signature changed               | Treat as breaking — audit all usages                 |
| Internal storage change only                 | Low risk, but verify no Wizard codegen depends on it |
| Breaking change of any kind                  | Full trace required before updating                  |
