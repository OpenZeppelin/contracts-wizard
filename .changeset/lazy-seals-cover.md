---
'@openzeppelin/wizard': minor
'@openzeppelin/wizard-common': patch
'@openzeppelin/contracts-mcp': minor
---

Update `@openzeppelin/contracts` and `@openzeppelin/contracts-upgradeable` dependencies to 5.5.0
- **Breaking changes**:
  - Solidity account signer: `ERC7702` option is renamed as `EIP7702`. Imported contract `SignerERC7702` is renamed as `SignerEIP7702`.
  - Solidity upgradeable contracts: `Initializable` and `UUPSUpgradeable` are imported from `@openzeppelin/contracts` instead of `@openzeppelin/contracts-upgradeable`.