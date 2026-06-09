---
'@openzeppelin/wizard': patch
'@openzeppelin/wizard-confidential': patch
'@openzeppelin/wizard-stellar': patch
'@openzeppelin/wizard-common': patch
'@openzeppelin/contracts-mcp': patch
---

Add optional `decimals` to Solidity `erc20`, `stablecoin`, `realWorldAsset`, Confidential `erc7984`, and Stellar `fungible`, `stablecoin`.
- When set to a non-default value, the generated contract overrides `decimals()` (Solidity, Confidential) or sets the metadata decimals (Stellar), and any premint amount is scaled to the chosen number of decimals.
- Defaults preserve existing output: 18 for Solidity, 6 for Confidential, 7 for Stellar.
