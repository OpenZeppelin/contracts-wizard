# Changelog


## 0.10.2 (2025-11-12)

- Solidity account signer: Add `WebAuthn` to the list of signers available. ([#718](https://github.com/OpenZeppelin/contracts-wizard/pull/718))
- Fixed bug with incorrect names in generated comment for Multisig account. ([#720](https://github.com/OpenZeppelin/contracts-wizard/pull/720))
- Add API function to get versioned remappings. ([#724](https://github.com/OpenZeppelin/contracts-wizard/pull/724))
- **Breaking changes**: Solidity Stablecoin and RWA: Change `custodian` option to `freezable`. Replace ERC20Custodian with ERC20Freezable. ([#719](https://github.com/OpenZeppelin/contracts-wizard/pull/719))
- Solidity account signer: Fix grammar in comment ([#711](https://github.com/OpenZeppelin/contracts-wizard/pull/711))

## 0.10.0 (2025-11-03)

- Update `@openzeppelin/contracts` and `@openzeppelin/contracts-upgradeable` dependencies to 5.5.0 ([#681](https://github.com/OpenZeppelin/contracts-wizard/pull/681))
  - **Breaking changes**:
    - Solidity account signer: `ERC7702` option is renamed as `EIP7702`. Imported contract `SignerERC7702` is renamed as `SignerEIP7702`.
    - Solidity upgradeable contracts: `Initializable` and `UUPSUpgradeable` are imported from `@openzeppelin/contracts` instead of `@openzeppelin/contracts-upgradeable`.

- **Breaking changes**: Solidity Stablecoin and RWA: Change `limitations` option to `restrictions`. Replace ERC20Allowlist and ERC20Blocklist with ERC20Restricted. ([#715](https://github.com/OpenZeppelin/contracts-wizard/pull/715))

## 0.9.0 (2025-10-29)

- **Breaking changes**: Use namespaced storage instead of state variables when upgradeability is enabled. ([#704](https://github.com/OpenZeppelin/contracts-wizard/pull/704))
  - For ERC-20, use namespaced storage for `tokenBridge` when cross-chain bridging is set to `'custom'` and upgradeability is enabled.
  - For ERC-721, use namespaced storage for `_nextTokenId` when mintable, auto increment IDs, and upgradeability are enabled.

## 0.8.1 (2025-10-14)

- Updated community-contracts digest version ([#659](https://github.com/OpenZeppelin/contracts-wizard/pull/659))
- Updated community-contracts digest version ([#677](https://github.com/OpenZeppelin/contracts-wizard/pull/677))

## 0.8.0 (2025-09-16)

- Add constructors for `SignerECDSA`, `SignerP256`, `SignerRSA`, `SignerERC7702`, `SignerERC7913`, `MultiSignerERC7913` and `MultiSignerERC7913Weighted` ([#609](https://github.com/OpenZeppelin/contracts-wizard/pull/609))
- Enable upgradeability for `AccountERC7579`, `AccountERC7579Hooked`, `SignerECDSA`, `SignerP256`, `SignerRSA`, `SignerERC7702`, `SignerERC7913` and `MultiSignerERC7913` ([#609](https://github.com/OpenZeppelin/contracts-wizard/pull/609))
- **Breaking change**: Use `Account`, `AccountERC7579`, `AccountERC7579Hooked`, `ERC7812`, `ERC7739Utils`, `ERC7913Utils`, `AbstractSigner`, `SignerECDSA`, `SignerP256`, `SignerRSA`, `SignerERC7702`, `SignerERC7913`, `MultiSignerERC7913`, and `MultiSignerERC7913Weighted` from OpenZeppelin Contracts 5.4.0 instead of Community Contracts ([#609](https://github.com/OpenZeppelin/contracts-wizard/pull/609))
- Remove all initializers from non-upgradeable accounts. ([#658](https://github.com/OpenZeppelin/contracts-wizard/pull/658))

## 0.7.1 (2025-08-15)

- Add compatible git commit in comments when importing OpenZeppelin Community Contracts ([#627](https://github.com/OpenZeppelin/contracts-wizard/pull/627))

## 0.7.0 (2025-08-12)

- **Breaking change**: Use ERC20Bridgeable from OpenZeppelin Contracts 5.4.0 instead of Community Contracts ([#619](https://github.com/OpenZeppelin/contracts-wizard/pull/619))

## 0.6.0 (2025-06-20)

- Add support for Wizard MCP server. ([#569](https://github.com/OpenZeppelin/contracts-wizard/pull/569))
  - **Possibly breaking changes**:
    - `Governor`: Remove usage of `access` option. This option now has no effect.

- `Accounts`: Add `_disableInitializers()` to account implementations ([#568](https://github.com/OpenZeppelin/contracts-wizard/pull/568))

## 0.5.6 (2025-05-21)

- `MultisigERC7913`: Add `onlyEntryPointOrSelf` modifier to public configuration functions. ([#554](https://github.com/OpenZeppelin/contracts-wizard/pull/554))
- Use `onlyGovernance` to restrict upgrades for Governor with UUPS ([#544](https://github.com/OpenZeppelin/contracts-wizard/pull/544))
  - **Potentially breaking changes**:
    - Governor with UUPS: `_authorizeUpgrade` function is restricted by `onlyGovernance` instead of `onlyOwner`

## 0.5.5 (2025-05-13)

- Add `account` contract types for ERC-4337. ([#486](https://github.com/OpenZeppelin/contracts-wizard/pull/486), [#523](https://github.com/OpenZeppelin/contracts-wizard/pull/523), [#527](https://github.com/OpenZeppelin/contracts-wizard/pull/527))
- Use unicode syntax for strings with non-ASCII characters ([#476](https://github.com/OpenZeppelin/contracts-wizard/pull/476))
- Remove redundant overrides in Governor. ([#522](https://github.com/OpenZeppelin/contracts-wizard/pull/522))
- Simplify Community Contracts imports. ([#537](https://github.com/OpenZeppelin/contracts-wizard/pull/537))
- **Potentially breaking changes**:
  - Update pragma versions to 0.8.27. ([#486](https://github.com/OpenZeppelin/contracts-wizard/pull/486))
  - Changes import path format for `@openzeppelin/community-contracts`. ([#537](https://github.com/OpenZeppelin/contracts-wizard/pull/537))

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
