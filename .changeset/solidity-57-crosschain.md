---
'@openzeppelin/wizard': patch
'@openzeppelin/wizard-common': patch
'@openzeppelin/contracts-mcp': patch
'@openzeppelin/contracts-cli': patch
---

Add Solidity cross-chain options for ERC721, ERC1155, and Governor using OpenZeppelin Contracts 5.7.
- ERC721/ERC1155: Add `crossChainBridging` and `crossChainLinkAllowOverride` options, using `ERC721Crosschain`/`ERC1155Crosschain`.
- Governor: Add `crossChainExecution` option, using `GovernorCrosschain`.
- Account: Update the `IERC4337` import path, which dropped its `draft-` prefix in Contracts 5.7.
- Fix compile errors in upgradeable ERC20 `crossChainBridging` variants.
- **Potentially breaking change**: Update to OpenZeppelin Contracts 5.7.0.
