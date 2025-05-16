---
"@openzeppelin/contracts-wizard": patch
---

Refine NatSpec documentation in generated contracts to improve developer experience:

- Remove redundant parameter documentation where function signatures are self-explanatory
- Add strategic documentation for non-obvious functions, focusing on implementation considerations
- Preserve critical inheritance and function resolution comments in account contracts
- Align documentation style with OpenZeppelin's contract library examples
- Document override functions only when they add significant value

This change follows the principle that documentation should provide insights beyond what's already visible in the code, while ensuring critical implementation details are preserved for developers.
