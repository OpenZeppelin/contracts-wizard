# Changelog


## 0.4.0 (2026-01-10)

- - Add support for `with_components` macro. ([#703](https://github.com/OpenZeppelin/contracts-wizard/pull/703)) ([#757](https://github.com/OpenZeppelin/contracts-wizard/pull/757))
  - Add AccessControlDefaultAdminRules. ([#698](https://github.com/OpenZeppelin/contracts-wizard/pull/698))
  - **Breaking changes**:
    - Use OpenZeppelin Contracts for Cairo v3.0.0. ([#757](https://github.com/OpenZeppelin/contracts-wizard/pull/757))
    - Use OpenZeppelin Contracts for Cairo v3.0.0-alpha.3. ([#688](https://github.com/OpenZeppelin/contracts-wizard/pull/688))
    - Use OpenZeppelin Contracts for Cairo v3.0.0-alpha.2. ([#663](https://github.com/OpenZeppelin/contracts-wizard/pull/663))
    - Use OpenZeppelin Contracts for Cairo v3.0.0-alpha.1. ([#638](https://github.com/OpenZeppelin/contracts-wizard/pull/638))
    - Use OpenZeppelin Contracts for Cairo v3.0.0-alpha.0. ([#623](https://github.com/OpenZeppelin/contracts-wizard/pull/623))

## 0.3.3 (2025-11-28)

- Add support for Uniswap Hooks Wizard ([#628](https://github.com/OpenZeppelin/contracts-wizard/pull/628))

## 0.3.2 (2025-11-26)

- Add tokenUri setting for stellar non fungible model ([#725](https://github.com/OpenZeppelin/contracts-wizard/pull/725))

## 0.3.1 (2025-11-12)

- Solidity account signer: Add `WebAuthn` to the list of signers available. ([#718](https://github.com/OpenZeppelin/contracts-wizard/pull/718))
- **Breaking changes**: Solidity Stablecoin and RWA: Change `custodian` option to `freezable`. Replace ERC20Custodian with ERC20Freezable. ([#719](https://github.com/OpenZeppelin/contracts-wizard/pull/719))
- Add macros descriptions for Cairo ([#703](https://github.com/OpenZeppelin/contracts-wizard/pull/703))

## 0.2.0 (2025-11-03)

- **Breaking changes**: Solidity Stablecoin and RWA: Change `limitations` option to `restrictions`. Replace ERC20Allowlist and ERC20Blocklist with ERC20Restricted. ([#715](https://github.com/OpenZeppelin/contracts-wizard/pull/715))
- Update `@openzeppelin/contracts` and `@openzeppelin/contracts-upgradeable` dependencies to 5.5.0 ([#681](https://github.com/OpenZeppelin/contracts-wizard/pull/681))
  - **Breaking changes**:
    - Solidity account signer: `ERC7702` option is renamed as `EIP7702`. Imported contract `SignerERC7702` is renamed as `SignerEIP7702`.
    - Solidity upgradeable contracts: `Initializable` and `UUPSUpgradeable` are imported from `@openzeppelin/contracts` instead of `@openzeppelin/contracts-upgradeable`.

## 0.1.2 (2025-10-29)

- Add AI descriptions for AccessControl in Cairo-alpha ([#698](https://github.com/OpenZeppelin/contracts-wizard/pull/698))

## 0.1.1 (2025-09-16)

- Update Solidity Account prompt ([#609](https://github.com/OpenZeppelin/contracts-wizard/pull/609))
- Support decimals customization for ERC20 Cairo contracts ([#654](https://github.com/OpenZeppelin/contracts-wizard/pull/654))

## 0.1.0 (2025-08-15)

- Bump minor version for semantic versioning stability ([#631](https://github.com/OpenZeppelin/contracts-wizard/pull/631))

## 0.0.3 (2025-08-12)

- **Breaking change**: Use ERC20Bridgeable from OpenZeppelin Contracts 5.4.0 instead of Community Contracts ([#619](https://github.com/OpenZeppelin/contracts-wizard/pull/619))

## 0.0.2 (2025-07-03)

- Stellar: Add Stablecoin with Limitations and Access Control (ownable and roles). ([#575](https://github.com/OpenZeppelin/contracts-wizard/pull/575))

## 0.0.1 (2025-06-20)

- Add support for Wizard MCP server. ([#569](https://github.com/OpenZeppelin/contracts-wizard/pull/569))
