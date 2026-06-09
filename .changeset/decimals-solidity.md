---
'@openzeppelin/wizard': patch
---

Add optional `decimals` to `erc20`, `stablecoin`, and `realWorldAsset`, which overrides `decimals()` when set to a non-default value. Defaults to 18, preserving existing output.
