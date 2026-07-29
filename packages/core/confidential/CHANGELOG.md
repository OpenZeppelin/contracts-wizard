# Changelog


## 0.1.2 (2026-06-11)

- Add optional `decimals` to `erc7984`, which overrides `decimals()` when set to a non-default value. Defaults to 6 as before, with a maximum of 10 since confidential token amounts are represented as uint64. Incompatible with `wrappable`, which derives its decimals from the underlying token (capped at 6). ([#812](https://github.com/OpenZeppelin/contracts-wizard/pull/812))
- ERC7984: Make `premint` incompatible with `wrappable`. ([#813](https://github.com/OpenZeppelin/contracts-wizard/pull/813))
  - Preminted tokens would not be backed by the underlying token of the wrapper, so combining the options now throws an `OptionsError`.
- Updated dependencies [[`11ce6a2`](https://github.com/OpenZeppelin/contracts-wizard/commit/11ce6a2cb49dbef46a95368151ff73a4f7739fd9), [`55b0dac`](https://github.com/OpenZeppelin/contracts-wizard/commit/55b0dacbdf581094498d9c621f602f641d50ba58)]:
  - @openzeppelin/wizard@0.10.10

## 0.1.1 (2026-04-07)

- Add package APIs for getting versioned remappings. ([#786](https://github.com/OpenZeppelin/contracts-wizard/pull/786))
  - Export `getVersionedRemappings` from the Solidity, Confidential, and Uniswap Hooks package roots for internal use by other Wizard packages.
  - Add `getVersionedRemappings` to the Confidential `erc7984` API and the Uniswap Hooks `hooks` API for consistency with the Solidity contract APIs.
  - **Internal breaking change**: Removed the internal `print-versioned` entrypoints; internal consumers should use `getVersionedRemappings` instead.
- Updated dependencies [[`234ab40`](https://github.com/OpenZeppelin/contracts-wizard/commit/234ab409114d81f9d6c429b7dc70c130cf72b5d1)]:
  - @openzeppelin/wizard@0.10.8

## 0.1.0 (2026-02-17)

- Add support for Confidential Contracts Wizard ([#652](https://github.com/OpenZeppelin/contracts-wizard/pull/652))
- Require Node.js 22 ([#652](https://github.com/OpenZeppelin/contracts-wizard/pull/652))
- Updated dependencies [[`17d9de8`](https://github.com/OpenZeppelin/contracts-wizard/commit/17d9de8054d8d783e1a1619798dda83828eb1ae1)]:
  - @openzeppelin/wizard@0.10.6
