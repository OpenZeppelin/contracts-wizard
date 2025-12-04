---
'@openzeppelin/wizard': patch
'@openzeppelin/contracts-mcp': patch
---

Solidity `erc20`, `stablecoin`, `realWorldAsset`: Support 'embedded' option for `crossChainBridging`.
- **Breaking changes**: Solidity `erc20`, `stablecoin`, `realWorldAsset`: 'custom' option for `crossChainBridging` now requires access control, and adds a function to allow updating the token bridge address after deployment.