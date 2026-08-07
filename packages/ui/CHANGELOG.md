# Changelog


## 0.0.3 (2026-08-07)

- Standardize crosschain terminology in user-facing text. ([#840](https://github.com/OpenZeppelin/contracts-wizard/pull/840))

## 0.0.2 (2026-08-07)

- Shrink MCP App package size by sharing one HTML template per language. ([#838](https://github.com/OpenZeppelin/contracts-wizard/pull/838))
  - Inject contract kind at serve time instead of shipping near-duplicate HTML per tool.
  - Scope MCP App Tailwind content away from web-only Wizard shells.
  - Bundle the Zama logo so it renders in self-contained MCP Apps.

## 0.0.1 (2026-08-05)

- Fix Governor Cross-Chain Execution appearing as an empty dropdown in the MCP App UI. ([#836](https://github.com/OpenZeppelin/contracts-wizard/pull/836))
