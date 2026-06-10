---
'@openzeppelin/wizard-confidential': patch
---

Add optional `decimals` to `erc7984`, which overrides `decimals()` when set to a non-default value. Defaults to 6, preserving existing output. Incompatible with `wrappable`, which uses the decimals of the underlying token.
