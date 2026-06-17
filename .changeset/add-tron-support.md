---
'@openzeppelin/wizard': patch
'@openzeppelin/wizard-common': patch
'@openzeppelin/contracts-mcp': patch
'@openzeppelin/contracts-cli': patch
---

Add TRON support: new `rewriteForTron` utility, `zip-hardhat-tron` and `zip-tronbox` generators, and `tron-*` tools in the MCP server and CLI. Generated source uses `TRC20` / `TRC721` / `TRC1155` and `@openzeppelin/tron-contracts` import paths, with the `pragma solidity` line capped at the current `tron-solc` maximum (`^0.8.26`). Upgradeable contracts are supported: source imports from `@openzeppelin/tron-contracts-upgradeable` (with `@openzeppelin/tron-contracts` as its peer), and because OpenZeppelin's Upgrades plugins don't target TRON, the Hardhat and TronBox downloads deploy the proxy by hand (deploy the implementation, then a `TRC1967Proxy` / `TransparentUpgradeableProxy` that runs `initialize()`). The Governor's `blockTime` defaults to 3 seconds on TRON (matching SR consensus) instead of inheriting Ethereum's 12, across the UI, CLI registry, and MCP `tron-governor` tool; exported as `TRON_DEFAULT_BLOCK_TIME` from `@openzeppelin/wizard`. A `sanitizeTronOptions` helper (also exported from `@openzeppelin/wizard`) downgrades the OP-Stack-only `superchain` cross-chain bridging option to `custom` on the TRON CLI/MCP surfaces, matching the UI.
