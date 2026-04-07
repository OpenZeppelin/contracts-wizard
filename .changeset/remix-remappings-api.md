---
'@openzeppelin/wizard': patch
'@openzeppelin/wizard-confidential': patch
'@openzeppelin/wizard-uniswap-hooks': patch
---

Add package APIs for getting versioned remappings.
- Export `getVersionedRemappings` from the Solidity, Confidential, and Uniswap Hooks package roots for internal use by other Wizard packages.
- Add `getVersionedRemappings` to the Confidential `erc7984` API and the Uniswap Hooks `hooks` API for consistency with the Solidity contract APIs.
- **Internal breaking change**: Removed the internal `print-versioned` entrypoints; internal consumers should use `getVersionedRemappings` instead.
