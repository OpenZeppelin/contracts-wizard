# Changelog

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
