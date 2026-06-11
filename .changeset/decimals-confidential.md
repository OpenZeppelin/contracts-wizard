---
'@openzeppelin/wizard-confidential': patch
---

Add optional `decimals` to `erc7984`, which overrides `decimals()` when set to a non-default value. Defaults to 6 as before, with a maximum of 10 since confidential token amounts are represented as uint64. Incompatible with `wrappable`, which derives its decimals from the underlying token (capped at 6).
