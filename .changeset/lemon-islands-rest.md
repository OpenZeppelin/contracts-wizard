---
'@openzeppelin/wizard': patch
---

Escape `opts.name` and `opts.uri` when generating Hardhat and Foundry test files. Only affects callers of `zipHardhat` / `zipFoundry`; these functions are not part of the documented public API.
