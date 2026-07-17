---
'@openzeppelin/wizard': patch
'@openzeppelin/wizard-common': patch
'@openzeppelin/contracts-mcp': patch
'@openzeppelin/contracts-cli': patch
---

Update OpenZeppelin Contracts to 5.7.0-rc.0. Add `crossChainBridging` (ERC-7786 native, via `ERC721Crosschain`/`ERC1155Crosschain`) and `crossChainLinkAllowOverride` options to Solidity ERC721 and ERC1155. Add `crossChainExecution` option to Solidity Governor, which adds the `GovernorCrosschain` extension for relaying proposal execution to other chains through ERC-7786 gateways and a `CrosschainRemoteExecutor`. Fix the upgradeable variant of ERC20 `crossChainBridging: 'erc7786native'` to reference `CrosschainLinkedUpgradeable.Link[]` in the initializer instead of the untranspiled `CrosschainLinked.Link[]`, which did not compile.
