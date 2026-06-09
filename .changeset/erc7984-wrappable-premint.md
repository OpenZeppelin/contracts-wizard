---
'@openzeppelin/wizard-confidential': patch
---

ERC7984: Make premint incompatible with the Wrappable extension.
- Preminted tokens would not be backed by the underlying token of the wrapper, so combining the options now throws an `OptionsError`.
