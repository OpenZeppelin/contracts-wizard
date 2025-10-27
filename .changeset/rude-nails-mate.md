---
'@openzeppelin/wizard': minor
---

**Breaking changes**: Use namespaced storage instead of state variables when upgradeability is enabled.
  - For ERC-20, use namespaced storage for `tokenBridge` when cross-chain bridging is set to `'custom'` and upgradeability is enabled.
  - For ERC-721, use namespaced storage for `_nextTokenId` when mintable, auto increment IDs, and upgradeability are enabled.