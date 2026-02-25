---
'@openzeppelin/wizard': patch
'@openzeppelin/contracts-mcp': patch
---

Solidity `erc20`, `stablecoin`, `realWorldAsset`: Support 'erc7786native' option for `crossChainBridging`.
- Uses OpenZeppelin Contracts 5.6.0
- **Breaking changes**: Solidity `erc20`, `stablecoin`, `realWorldAsset`: 'custom' option for `crossChainBridging` now requires access control, and adds a function to allow updating the token bridge address after deployment. Constructor/initializer parameter order changed due to access control requirement.