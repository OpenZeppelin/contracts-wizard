# Changelog

## 0.5.4 (2025-04-01)

- Add validation for ERC20 premint field. ([#488](https://github.com/OpenZeppelin/contracts-wizard/pull/488))
- Add `callback` in ERC20 features. ([#500](https://github.com/OpenZeppelin/contracts-wizard/pull/500))

## 0.5.3 (2025-03-13)

- Add ERC20 Cross-Chain Bridging, SuperchainERC20. ([#436](https://github.com/OpenZeppelin/contracts-wizard/pull/436))
**Note:** Cross-Chain Bridging is experimental and may be subject to change.

- **Potentially breaking changes**:
  - Change order of constructor argument `recipient` when using `premint`.

## 0.5.2 (2025-02-21)

- Fix modifiers order to follow Solidity style guides. ([#450](https://github.com/OpenZeppelin/contracts-wizard/pull/450))
- ERC721: Return tokenId on safeMint with incremental id. ([#455](https://github.com/OpenZeppelin/contracts-wizard/pull/455))

## 0.5.1 (2025-02-05)

- **Potentially breaking changes**:
  - Add constructor argument `recipient` when using `premint` in `erc20`, `stablecoin`, and `realWorldAsset`. ([#435](https://github.com/OpenZeppelin/contracts-wizard/pull/435))

## 0.5.0 (2025-01-23)

- Update to use TypeScript v5. ([#231](https://github.com/OpenZeppelin/contracts-wizard/pull/231))
- Remove unused dependencies. ([#430](https://github.com/OpenZeppelin/contracts-wizard/pull/430))

- **Breaking changes**:
  - Update Contracts Wizard license to AGPLv3. ([#424](https://github.com/OpenZeppelin/contracts-wizard/pull/424))

## 0.4.6 (2024-11-20)

- Use named imports. ([#411](https://github.com/OpenZeppelin/contracts-wizard/pull/411))

## 0.4.5 (2024-11-18)

- Add `stablecoin` and `realWorldAsset` contract types. ([#404](https://github.com/OpenZeppelin/contracts-wizard/pull/404))
**Note:** `stablecoin` and `realWorldAsset` are experimental and may be subject to change.

## 0.4.4 (2024-10-23)

### Potentially breaking changes
- Update pragma versions to 0.8.22. ([#401](https://github.com/OpenZeppelin/contracts-wizard/pull/401))

## 0.4.3 (2024-04-08)

- Add timestamp based Governor and Votes clock options. ([#347](https://github.com/OpenZeppelin/contracts-wizard/pull/347))

## 0.4.2 (2024-02-22)

- Add code comments for compatible OpenZeppelin Contracts versions. ([#331](https://github.com/OpenZeppelin/contracts-wizard/pull/331))

## 0.4.1 (2023-10-18)

- Add `managed` access control option for use with AccessManager. ([#298](https://github.com/OpenZeppelin/contracts-wizard/pull/298))

## 0.4.0 (2023-10-05)

### Breaking changes
- Update to OpenZeppelin Contracts 5.0. ([#284](https://github.com/OpenZeppelin/contracts-wizard/pull/284))
- Require constructor or initializer arguments for initial owner or role assignments if using access control.
- Use token-specific pausable extensions.
- Enable ERC20Permit by default.

## 0.3.0 (2023-05-25)

- **Breaking change**: Update to OpenZeppelin Contracts 4.9. ([#252](https://github.com/OpenZeppelin/contracts-wizard/pull/252))
- Change default voting delay to 1 day in `governor`. ([#258](https://github.com/OpenZeppelin/contracts-wizard/pull/258))

## 0.2.3 (2023-03-23)

- Fix module not found error. ([#235](https://github.com/OpenZeppelin/contracts-wizard/issues/235))

## 0.2.2 (2023-03-17)

- Fix missing file. ([#234](https://github.com/OpenZeppelin/contracts-wizard/pull/234))

## 0.2.1 (2023-03-17)

- Remove unspecified dependency on `@openzeppelin/contracts`. ([#233](https://github.com/OpenZeppelin/contracts-wizard/pull/233))

## 0.2.0 (2022-11-08)

- Reduce default block time to 12 seconds in `governor`. ([fdcf912](https://github.com/OpenZeppelin/contracts-wizard/commit/fdcf9129354692b3b7e0fa694233fdd62a1e99bb))
- **Breaking change**: Update to OpenZeppelin Contracts 4.8 and Solidity ^0.8.9. ([#199](https://github.com/OpenZeppelin/contracts-wizard/pull/199))

## 0.1.1 (2022-06-30)

- Support custom contract type, optional access control. ([#112](https://github.com/OpenZeppelin/contracts-wizard/pull/112))

## 0.1.0 (2022-06-15)

- Initial API for Solidity. ([#136](https://github.com/OpenZeppelin/contracts-wizard/pull/136))
