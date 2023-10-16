# Changelog

## Unreleased

- Add `managed` access control option for use with AccessManager.

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
