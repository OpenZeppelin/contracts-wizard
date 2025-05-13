---
'@openzeppelin/wizard': patch
---

Use `onlyGovernance` to restrict upgrades for Governor with UUPS
- **Potentially breaking changes**:
  - Governor with UUPS: `_authorizeUpgrade` function is restricted by `onlyGovernance` instead of `onlyOwner`
