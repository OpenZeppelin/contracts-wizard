# Changelog


## 0.5.1 (2026-01-14)

- Stellar: add an explicitImplementations flag that switches from using default_impl macro to explicit definitions ([#728](https://github.com/OpenZeppelin/contracts-wizard/pull/728))
- Updated dependencies [[`aa0f0d2`](https://github.com/OpenZeppelin/contracts-wizard/commit/aa0f0d29c1dcad1297c3a2eea3081c8e93a56df1)]:
  - @openzeppelin/wizard-stellar@0.4.5
  - @openzeppelin/wizard-common@0.4.1

## 0.5.0 (2026-01-10)

- Add support for `with_components` macro. ([#703](https://github.com/OpenZeppelin/contracts-wizard/pull/703))
- Add AccessControlDefaultAdminRules. ([#698](https://github.com/OpenZeppelin/contracts-wizard/pull/698))

- **Breaking changes**:
  - Use OpenZeppelin Contracts for Cairo v3.0.0. ([#757](https://github.com/OpenZeppelin/contracts-wizard/pull/757))
  - Use OpenZeppelin Contracts for Cairo v3.0.0-alpha.3. ([#688](https://github.com/OpenZeppelin/contracts-wizard/pull/688))
  - Use OpenZeppelin Contracts for Cairo v3.0.0-alpha.2. ([#663](https://github.com/OpenZeppelin/contracts-wizard/pull/663))
  - Use OpenZeppelin Contracts for Cairo v3.0.0-alpha.1. ([#638](https://github.com/OpenZeppelin/contracts-wizard/pull/638))
  - Use OpenZeppelin Contracts for Cairo v3.0.0-alpha.0. ([#623](https://github.com/OpenZeppelin/contracts-wizard/pull/623))

- Updated dependencies [[`53c042a`](https://github.com/OpenZeppelin/contracts-wizard/commit/53c042af852097bace639b47ec2fbfc813e38ac9)]:
  - @openzeppelin/wizard-cairo@3.0.0
  - @openzeppelin/wizard-common@0.4.0

## 0.4.6 (2025-12-12)

- Updated dependencies [[`ce60539`](https://github.com/OpenZeppelin/contracts-wizard/commit/ce6053924898e3ecbc8f80e05502786ddbc5e559)]:
  - @openzeppelin/wizard-stylus@0.3.0

## 0.4.5 (2025-12-08)

- Fix dependency on @openzeppelin/wizard-uniswap-hooks ([#748](https://github.com/OpenZeppelin/contracts-wizard/pull/748))

## 0.4.4 (2025-11-28)

- Add support for Uniswap Hooks Wizard ([#628](https://github.com/OpenZeppelin/contracts-wizard/pull/628))
- Updated dependencies [[`985d5a4`](https://github.com/OpenZeppelin/contracts-wizard/commit/985d5a48ff513978e364ada8184dbf82f8676f49)]:
  - @openzeppelin/wizard@0.10.4
  - @openzeppelin/wizard-common@0.3.3

## 0.4.3 (2025-11-26)

- Add tokenUri setting for stellar non fungible model ([#725](https://github.com/OpenZeppelin/contracts-wizard/pull/725))
- Updated dependencies [[`3bb0213`](https://github.com/OpenZeppelin/contracts-wizard/commit/3bb02139b5a3b7a4098859a8e6824d7ac6e0fc6f), [`57dabc8`](https://github.com/OpenZeppelin/contracts-wizard/commit/57dabc812e0639635c01cad7445c33d6cbfcc61a)]:
  - @openzeppelin/wizard-stellar@0.4.4
  - @openzeppelin/wizard-common@0.3.2
  - @openzeppelin/wizard@0.10.3

## 0.4.2 (2025-11-12)

- Solidity account signer: Add `WebAuthn` to the list of signers available. ([#718](https://github.com/OpenZeppelin/contracts-wizard/pull/718))
- Updated dependencies [[`be91f8f`](https://github.com/OpenZeppelin/contracts-wizard/commit/be91f8fee6f66ae8a045394fded8d46ef1383b9f)]:
  - @openzeppelin/wizard@0.10.2
  - @openzeppelin/wizard-common@0.3.1
- **Breaking changes**: Solidity Stablecoin and RWA: Change `custodian` option to `freezable`. Replace ERC20Custodian with ERC20Freezable. ([#719](https://github.com/OpenZeppelin/contracts-wizard/pull/719))
- Updated dependencies [[`6b8f8f5`](https://github.com/OpenZeppelin/contracts-wizard/commit/6b8f8f52b973946ea6ce441dcbc1cbf3c3a848f2), [`c14be02`](https://github.com/OpenZeppelin/contracts-wizard/commit/c14be0291fca353946fc7583046de8669c209cc4), [`bec86b5`](https://github.com/OpenZeppelin/contracts-wizard/commit/bec86b542daf8d4ebacaa512b5a66f970500f826), [`ce8fbba`](https://github.com/OpenZeppelin/contracts-wizard/commit/ce8fbba5f006fcbc822e9e42b860c9fa7a9827df), [`5c1fa0f`](https://github.com/OpenZeppelin/contracts-wizard/commit/5c1fa0f29c8a86952a9be111235e8cd615a889ca)]:
  - @openzeppelin/wizard@0.10.1
  - @openzeppelin/wizard-common@0.3.0

## 0.4.0 (2025-11-03)

- Update `@openzeppelin/contracts` and `@openzeppelin/contracts-upgradeable` dependencies to 5.5.0 ([#681](https://github.com/OpenZeppelin/contracts-wizard/pull/681))
  - **Breaking changes**:
    - Solidity account signer: `ERC7702` option is renamed as `EIP7702`. Imported contract `SignerERC7702` is renamed as `SignerEIP7702`.
    - Solidity upgradeable contracts: `Initializable` and `UUPSUpgradeable` are imported from `@openzeppelin/contracts` instead of `@openzeppelin/contracts-upgradeable`.

- **Breaking changes**: Solidity Stablecoin and RWA: Change `limitations` option to `restrictions`. Replace ERC20Allowlist and ERC20Blocklist with ERC20Restricted. ([#715](https://github.com/OpenZeppelin/contracts-wizard/pull/715))
- Updated dependencies [[`880b9b8`](https://github.com/OpenZeppelin/contracts-wizard/commit/880b9b84c2d179a48372befe83f3693e9526f6f7), [`b49e056`](https://github.com/OpenZeppelin/contracts-wizard/commit/b49e0568724ab355633dcada70bcaf9cc938374a)]:
  - @openzeppelin/wizard-common@0.2.0
  - @openzeppelin/wizard@0.10.0

## 0.3.0 (2025-10-29)

- **Breaking changes**: Solidity: Use namespaced storage instead of state variables when upgradeability is enabled. ([#704](https://github.com/OpenZeppelin/contracts-wizard/pull/704))
  - For ERC-20, use namespaced storage for `tokenBridge` when cross-chain bridging is set to `'custom'` and upgradeability is enabled.
  - For ERC-721, use namespaced storage for `_nextTokenId` when mintable, auto increment IDs, and upgradeability are enabled.
- Updated dependencies [[`38da80c`](https://github.com/OpenZeppelin/contracts-wizard/commit/38da80c4e92eaef55d313e747df8a2a01f1211f6), [`0f0509d`](https://github.com/OpenZeppelin/contracts-wizard/commit/0f0509d6691893f60508735d83a8d8a4abd561b7)]:
  - @openzeppelin/wizard@0.9.0
  - @openzeppelin/wizard-common@0.1.2

## 0.2.0 (2025-09-16)

- Add constructors for `SignerECDSA`, `SignerP256`, `SignerRSA`, `SignerERC7702`, `SignerERC7913`, `MultiSignerERC7913` and `MultiSignerERC7913Weighted` ([#609](https://github.com/OpenZeppelin/contracts-wizard/pull/609))
- Enable upgradeability for `AccountERC7579`, `AccountERC7579Hooked`, `SignerECDSA`, `SignerP256`, `SignerRSA`, `SignerERC7702`, `SignerERC7913` and `MultiSignerERC7913` ([#609](https://github.com/OpenZeppelin/contracts-wizard/pull/609))
- **Breaking change**: Use `Account`, `AccountERC7579`, `AccountERC7579Hooked`, `ERC7812`, `ERC7739Utils`, `ERC7913Utils`, `AbstractSigner`, `SignerECDSA`, `SignerP256`, `SignerRSA`, `SignerERC7702`, `SignerERC7913`, `MultiSignerERC7913`, and `MultiSignerERC7913Weighted` from OpenZeppelin Contracts 5.4.0 instead of Community Contracts ([#609](https://github.com/OpenZeppelin/contracts-wizard/pull/609))
- Support decimals customization for ERC20 Cairo contracts ([#654](https://github.com/OpenZeppelin/contracts-wizard/pull/654))
- Updated dependencies [[`41d5c74`](https://github.com/OpenZeppelin/contracts-wizard/commit/41d5c74d3aa3734a02b7b88c959634bb42fa6d20), [`b9d58dc`](https://github.com/OpenZeppelin/contracts-wizard/commit/b9d58dcd8e38fb5ceca23b082b15d78d02dcb1cf), [`41d5c74`](https://github.com/OpenZeppelin/contracts-wizard/commit/41d5c74d3aa3734a02b7b88c959634bb42fa6d20), [`41d5c74`](https://github.com/OpenZeppelin/contracts-wizard/commit/41d5c74d3aa3734a02b7b88c959634bb42fa6d20), [`41d5c74`](https://github.com/OpenZeppelin/contracts-wizard/commit/41d5c74d3aa3734a02b7b88c959634bb42fa6d20), [`029790c`](https://github.com/OpenZeppelin/contracts-wizard/commit/029790c9134b0556b214a405488c1e26472857a7)]:
  - @openzeppelin/wizard-common@0.1.1
  - @openzeppelin/wizard@0.8.0
  - @openzeppelin/wizard-cairo@2.1.0

## 0.1.1 (2025-09-02)

- Cairo: Support decimals value added to ERC-20 scheme ([#654](https://github.com/OpenZeppelin/contracts-wizard/pull/654))

## 0.1.0 (2025-08-15)

- Export functions to register MCP tools ([#631](https://github.com/OpenZeppelin/contracts-wizard/pull/631))
- Updated dependencies [[`2bb2a16`](https://github.com/OpenZeppelin/contracts-wizard/commit/2bb2a166616ac5005ee2bed643b10f24b5d9f086), [`c65acb7`](https://github.com/OpenZeppelin/contracts-wizard/commit/c65acb71bc10a77d7629ebfe30cc8dba397b09b1)]:
  - @openzeppelin/wizard@0.7.1
  - @openzeppelin/wizard-common@0.1.0

## 0.0.7 (2025-08-12)

- Updated dependencies [[`f39adfd`](https://github.com/OpenZeppelin/contracts-wizard/commit/f39adfdafa0fe772e292f48f5182e488c096132c)]:
  - @openzeppelin/wizard@0.7.0
  - @openzeppelin/wizard-common@0.0.3

## 0.0.6 (2025-07-29)

- Update Wizard API dependencies ([#612](https://github.com/OpenZeppelin/contracts-wizard/pull/612))

## 0.0.5 (2025-07-25)

- **Breaking changes**: Renamed package from `@openzeppelin/wizard-mcp` to `@openzeppelin/contracts-mcp` ([#607](https://github.com/OpenZeppelin/contracts-wizard/pull/607))

## 0.0.4 (2025-07-22)

- Updated dependencies [[`9e61c0f`](https://github.com/OpenZeppelin/contracts-wizard/commit/9e61c0ff0553bbba5e723495bfc5ee963174fc16)]:
  - @openzeppelin/wizard-stellar@0.4.1

## 0.0.3 (2025-07-03)

- Stellar: Add Stablecoin with Limitations and Access Control (ownable and roles). ([#575](https://github.com/OpenZeppelin/contracts-wizard/pull/575))
  - **Potentially breaking changes**:
    - Use OpenZeppelin Stellar Soroban Contracts v0.3.0
- Updated dependencies [[`4b86b07`](https://github.com/OpenZeppelin/contracts-wizard/commit/4b86b076214b6aa9b62e472b431d5d2ffdd96ffb), [`4b86b07`](https://github.com/OpenZeppelin/contracts-wizard/commit/4b86b076214b6aa9b62e472b431d5d2ffdd96ffb)]:
  - @openzeppelin/wizard-stellar@0.3.0
  - @openzeppelin/wizard-common@0.0.2

## 0.0.2 (2025-06-27)

- Add security contact for stellar ([#585](https://github.com/OpenZeppelin/contracts-wizard/pull/585))
- Updated dependencies [[`8997a89`](https://github.com/OpenZeppelin/contracts-wizard/commit/8997a891415512606bc97df6d8c7c0df7b4d2127)]:
  - @openzeppelin/wizard-stellar@0.2.3

## 0.0.1 (2025-06-20)

- Add support for Wizard MCP server. ([#569](https://github.com/OpenZeppelin/contracts-wizard/pull/569))
