---
'@openzeppelin/wizard-cairo': minor
'@openzeppelin/wizard-common': patch
'@openzeppelin/contracts-mcp': patch
'@openzeppelin/contracts-cli': patch
'ui': patch
---

Cairo: Add ERC20FlashMint extension for the ERC20 token kind.
- Configurable max flash loan (default or custom cap), flash fee (percent of the loan amount or custom stub), and fee destination (burn or fee receiver).
- Add `flashmint` options to the `cairo-erc20` MCP tool and CLI command.
