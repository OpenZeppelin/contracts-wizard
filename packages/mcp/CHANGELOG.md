# Changelog


## 0.2.1 (2025-10-29)

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
