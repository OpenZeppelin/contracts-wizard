# Changelog

## 1.0.0 (2025-02-25)

- **Breaking changes**:
  - Use OpenZeppelin Contracts for Cairo v1.0.0. ([#458](https://github.com/OpenZeppelin/contracts-wizard/pull/458))

## 0.21.1 (2025-01-23)

- Update to use TypeScript v5. ([#231](https://github.com/OpenZeppelin/contracts-wizard/pull/231))
- Remove unused dependencies. ([#430](https://github.com/OpenZeppelin/contracts-wizard/pull/430))

## 0.21.0 (2025-01-13)

- Add Vesting tab. ([#425](https://github.com/OpenZeppelin/contracts-wizard/pull/425))

- **Breaking changes**:
  - Remove `isAccessControlRequired` from `governor` and `vesting`. ([#426](https://github.com/OpenZeppelin/contracts-wizard/pull/426))
  - Update Contracts Wizard license to AGPLv3. ([#424](https://github.com/OpenZeppelin/contracts-wizard/pull/424))

## 0.20.1 (2024-12-17)

- Add OutsideExecution to accounts. ([#422](https://github.com/OpenZeppelin/contracts-wizard/pull/422))

## 0.20.0 (2024-12-10)

- Add Governor tab. ([#417](https://github.com/OpenZeppelin/contracts-wizard/pull/417))

- **Breaking changes**:
  - Use OpenZeppelin Contracts for Cairo v0.20.0. ([#419](https://github.com/OpenZeppelin/contracts-wizard/pull/419))

## 0.19.0 (2024-11-27)

- Add ERC2981 (RoyaltyInfo) for ERC721 and ERC1155. ([#413](https://github.com/OpenZeppelin/contracts-wizard/pull/413))

## 0.18.0 (2024-11-15)

- **Breaking changes**:
  - Use OpenZeppelin Contracts for Cairo v0.19.0. ([#405](https://github.com/OpenZeppelin/contracts-wizard/pull/405))

## 0.17.0 (2024-10-22)

- Add ERC721 votes. ([#399](https://github.com/OpenZeppelin/contracts-wizard/pull/399))

- **Breaking changes**:
  - Use OpenZeppelin Contracts for Cairo v0.18.0. ([#399](https://github.com/OpenZeppelin/contracts-wizard/pull/399))
  - Use `VotesComponent` for ERC20 votes.

## 0.16.0 (2024-09-26)

- Add ERC721Enumerable. ([#391](https://github.com/OpenZeppelin/contracts-wizard/pull/391))

- **Breaking changes**:
  - Use OpenZeppelin Contracts for Cairo v0.17.0. ([#396](https://github.com/OpenZeppelin/contracts-wizard/pull/396))

## 0.15.0 (2024-09-19)

- Add Account and EthAccount. ([#387](https://github.com/OpenZeppelin/contracts-wizard/pull/387))

- **Breaking changes**:
  - Use OpenZeppelin Contracts for Cairo v0.15.0. ([#378](https://github.com/OpenZeppelin/contracts-wizard/pull/378))
  - Use OpenZeppelin Contracts for Cairo v0.16.0. ([#384](https://github.com/OpenZeppelin/contracts-wizard/pull/384))

## 0.14.0 (2024-06-20)

- **Breaking changes**:
  - Use OpenZeppelin Contracts for Cairo v0.14.0. ([#369](https://github.com/OpenZeppelin/contracts-wizard/pull/369))
  - Fix compile error with ERC1155 Burnable.

## 0.13.0 (2024-05-22)

- **Breaking changes**:
  - Use OpenZeppelin Contracts for Cairo v0.13.0. ([#359](https://github.com/OpenZeppelin/contracts-wizard/pull/359))
  - Use Hooks with ERC721 and ERC1155.
  - Use Hooks for Pausable.

## 0.12.0 (2024-05-01)

- Add `votes` option to ERC20. ([#355](https://github.com/OpenZeppelin/contracts-wizard/pull/355))
- Require `appName` and `appVersion` when `votes` is enabled.
- Sort implemented traits.
- **Breaking changes**:
  - Use OpenZeppelin Contracts for Cairo v0.12.0.
  - Use Hooks with ERC20.

## 0.11.0 (2024-04-17)

- **Breaking changes**:
  - Set `upgradeable` to `true` by default. ([#334](https://github.com/OpenZeppelin/contracts-wizard/pull/334))

## 0.10.2 (2024-04-03)

- Use OpenZeppelin Contracts for Cairo v0.11.0. ([#351](https://github.com/OpenZeppelin/contracts-wizard/pull/351))
- Add ERC1155.
- Remove redundant not paused assertions for camel case functions.
- Fix use of ERC20 mixin.
- Sort imports alphabetically.

## 0.10.1 (2024-03-27)

- Use mixins. ([#348](https://github.com/OpenZeppelin/contracts-wizard/pull/348))

## 0.10.0 (2024-03-12)

- **Breaking changes**:
  - Use OpenZeppelin Contracts for Cairo v0.10.0. ([#344](https://github.com/OpenZeppelin/contracts-wizard/pull/344))
  - ERC721: Remove token URI parameter from safe mint functions.
  - ERC721: Add optional base URI parameter. If not set, this defaults to empty string.
  - Use string literals for ByteArray initialization instead of short strings.

## 0.9.2 (2024-02-26)

- Remove code comment for Cairo lang version. ([#337](https://github.com/OpenZeppelin/contracts-wizard/pull/337))

## 0.9.1 (2024-02-22)

- Add code comments for compatible OpenZeppelin Contracts for Cairo and Cairo lang versions. ([#331](https://github.com/OpenZeppelin/contracts-wizard/pull/331))

## 0.9.0 (2024-02-12)

- **Breaking changes**:
  - Remove non-standard `safeAllowance` option from ERC20. ([#324](https://github.com/OpenZeppelin/contracts-wizard/pull/324))
  - Use `abi(embed_v0)` attribute instead of `external` for impls derived from interfaces.
  - Use `abi(per_item)` attribute instead of `external` for impls with generated traits.

## 0.8.0 (2023-12-11)

- **Breaking changes**:
  - Use Cairo 1+ and OpenZeppelin Contracts for Cairo v0.8.0.
  - Remove functions for `getInitialSupply` and `toUint256`.
  - Remove ERC1155.
  - Role-Based Access Control adds separate constructor arguments to assign different users for different roles.
  - Throws error if `name` results in an identifer that is empty or does not have valid characters.
  - Throws error if `name` or `symbol` result in strings longer than 31 characters.

## 0.6.0 (2023-01-11)

- Add ERC1155. ([#167](https://github.com/OpenZeppelin/contracts-wizard/pull/167))
- Update formatting. ([#217](https://github.com/OpenZeppelin/contracts-wizard/pull/217))
- **Breaking change**: Renamed `isApprovedForAll` return variable name (`isApproved` -> `approved`) in ERC721. ([#167](https://github.com/OpenZeppelin/contracts-wizard/pull/167))

## 0.5.0 (2022-09-22)

- Add `owner` view for Ownable. ([#165](https://github.com/OpenZeppelin/contracts-wizard/issues/165))
- Implement Cairo 0.10 syntax changes. ([#173](https://github.com/OpenZeppelin/contracts-wizard/issues/173))

## 0.4.0 (2022-08-04)

- Update directory structure for libraries. ([#157](https://github.com/OpenZeppelin/contracts-wizard/pull/157))

## 0.3.1 (2022-07-12)

- Add Role-Based Access Control. ([#147](https://github.com/OpenZeppelin/contracts-wizard/pull/147))

## 0.3.0 (2022-07-01)

- Support Contracts for Cairo v0.2.0. ([#135](https://github.com/OpenZeppelin/contracts-wizard/pull/135))
- Support custom contract type, optional access control. ([#140](https://github.com/OpenZeppelin/contracts-wizard/pull/140))

## 0.2.0 (2022-06-15)

- Update API format for Cairo. ([#136](https://github.com/OpenZeppelin/contracts-wizard/pull/136))
- Add functions for getInitialSupply and toUint256. ([#138](https://github.com/OpenZeppelin/contracts-wizard/pull/138))

## 0.1.0 (2022-05-13)

- Initial API for Cairo. ([#127](https://github.com/OpenZeppelin/contracts-wizard/pull/127))
