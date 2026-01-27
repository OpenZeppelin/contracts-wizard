---
'@openzeppelin/wizard-stellar': minor
'@openzeppelin/wizard-common': minor
---

Refactor Stellar contracts to match the latest v0.6.0
  - **Breaking changes**:
    - Use OpenZeppelin Stellar Soroban Contracts v0.6.0
    - Use `MuxedAddress` for fungible transfer function
    - Change order of parameters in access control

Change default fungible decimals to 7
