# Changelog


## 0.4.5 (2026-01-14)

- Stellar: add an explicitImplementations flag that switches from using default_impl macro to explicit definitions ([#728](https://github.com/OpenZeppelin/contracts-wizard/pull/728))

## 0.4.4 (2025-11-26)

- Add tokenUri setting for stellar non fungible model ([#725](https://github.com/OpenZeppelin/contracts-wizard/pull/725))

## 0.4.3 (2025-10-14)

- Set security contact as contract metadata ([#679](https://github.com/OpenZeppelin/contracts-wizard/pull/679))

## 0.4.2 (2025-07-25)

- Fix access control dependency import to import from `stellar_access` instead of `stellar_contract_utils` ([#608](https://github.com/OpenZeppelin/contracts-wizard/pull/608))

## 0.4.1 (2025-07-22)

- Dependencies from crates.io and remove unused imports ([#602](https://github.com/OpenZeppelin/contracts-wizard/pull/602))
  - **Breaking changes**:
    - Use OpenZeppelin Stellar Soroban Contracts v0.4.1

## 0.3.0 (2025-07-03)

- Add Stablecoin with Limitations and Access Control (ownable and roles). ([#575](https://github.com/OpenZeppelin/contracts-wizard/pull/575))
  - **Breaking changes**:
    - Use OpenZeppelin Stellar Soroban Contracts v0.3.0

## 0.2.3 (2025-06-27)

- Add security contact in contract info ([#563](https://github.com/OpenZeppelin/contracts-wizard/pull/563))

## 0.2.2 (2025-06-20)

- Add support for Wizard MCP server. ([#569](https://github.com/OpenZeppelin/contracts-wizard/pull/569))

## 0.2.1 (2025-06-10)

- Fix missing `ContractOverrides` import and rename `defaultimpl` to `default_impl`. ([#566](https://github.com/OpenZeppelin/contracts-wizard/pull/566))

## 0.2.0 (2025-05-13)

- Add NonFungible extension and minor refactorings to Fungible (crate renamings, etc.). ([#531](https://github.com/OpenZeppelin/contracts-wizard/pull/531))
- **Breaking changes:**
  - Use OpenZeppelin Stellar Soroban Contracts v0.2.0

## 0.1.1 (2025-03-03)

- Add a default no_std to all contracts. ([#471](https://github.com/OpenZeppelin/contracts-wizard/pull/471))

## 0.1.0 (2025-02-25)

- Initial version. ([#460](https://github.com/OpenZeppelin/contracts-wizard/pull/460))
