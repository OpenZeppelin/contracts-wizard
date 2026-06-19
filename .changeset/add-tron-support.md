---
'@openzeppelin/wizard': patch
'@openzeppelin/wizard-common': patch
'@openzeppelin/contracts-mcp': patch
'@openzeppelin/contracts-cli': patch
---

Add support for TRON Contracts.
- Covers TRC20, TRC721, TRC1155, Governor, and Custom contracts.
- On TRON, the Governor's `blockTime` defaults to 3 seconds to match its block production.
