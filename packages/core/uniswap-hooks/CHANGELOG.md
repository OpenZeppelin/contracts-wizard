# Changelog


## 0.1.1 (2026-04-07)

- Add package APIs for getting versioned remappings. ([#786](https://github.com/OpenZeppelin/contracts-wizard/pull/786))
  - Export `getVersionedRemappings` from the Solidity, Confidential, and Uniswap Hooks package roots for internal use by other Wizard packages.
  - Add `getVersionedRemappings` to the Confidential `erc7984` API and the Uniswap Hooks `hooks` API for consistency with the Solidity contract APIs.
  - **Internal breaking change**: Removed the internal `print-versioned` entrypoints; internal consumers should use `getVersionedRemappings` instead.
- Updated dependencies [[`234ab40`](https://github.com/OpenZeppelin/contracts-wizard/commit/234ab409114d81f9d6c429b7dc70c130cf72b5d1)]:
  - @openzeppelin/wizard@0.10.8

## 0.1.0 (2025-11-28)

- Add support for Uniswap Hooks Wizard ([#628](https://github.com/OpenZeppelin/contracts-wizard/pull/628))
- Fix package dependency ([#743](https://github.com/OpenZeppelin/contracts-wizard/pull/743))
- Updated dependencies [[`985d5a4`](https://github.com/OpenZeppelin/contracts-wizard/commit/985d5a48ff513978e364ada8184dbf82f8676f49)]:
  - @openzeppelin/wizard@0.10.4
