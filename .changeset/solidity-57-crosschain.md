---
'@openzeppelin/wizard': patch
'@openzeppelin/wizard-common': patch
'@openzeppelin/contracts-mcp': patch
'@openzeppelin/contracts-cli': patch
---

Add Solidity cross-chain options for ERC721, ERC1155, and Governor using OpenZeppelin Contracts 5.7.
- ERC721/ERC1155: Add `crossChainBridging` and `crossChainLinkAllowOverride` options, using `ERC721Crosschain`/`ERC1155Crosschain`.
- Governor: Add `crossChainExecution` option, using `GovernorCrosschain`.
- Update OpenZeppelin Contracts to 5.7.0-rc.0.
- Fix compile errors in upgradeable ERC20 `crossChainBridging` variants.
