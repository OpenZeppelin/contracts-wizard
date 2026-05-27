---
'@openzeppelin/wizard': patch
'@openzeppelin/wizard-common': patch
'@openzeppelin/contracts-mcp': patch
'@openzeppelin/contracts-cli': patch
---

Add TRON support: new `rewriteForTron` utility, `zip-hardhat-tron` and `zip-tronbox` generators, and `tron-*` tools in the MCP server and CLI. Generated source uses `TRC20` / `TRC721` / `TRC1155` and `@openzeppelin/tron-contracts` import paths, with the `pragma solidity` line capped at the current `tron-solc` maximum (`^0.8.26`). Upgradeable downloads are intentionally gated off on TRON until `@openzeppelin/tron-contracts` ships the transpiled upgradeable variants.
