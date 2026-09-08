---
'@openzeppelin/wizard-miden': minor
'@openzeppelin/wizard-common': minor
'@openzeppelin/contracts-cli': minor
'@openzeppelin/contracts-mcp': minor
'ui': minor
---

Add Miden as a new Wizard language with `Fungible` and `NonFungible` faucet accounts.
- New `@openzeppelin/wizard-miden` package generating Rust code that composes the standard account components of the Miden protocol (`miden-protocol` and `miden-standards` crates, `next` branch) into a fungible or non-fungible faucet account.
- Options: token metadata (name, symbol, decimals, max supply, description, logo URI, external link or contract URI, updatable metadata and max supply), burnable, minimum burn amount, pausable, transfer restrictions (allowlist or blocklist), switchable policies and access control (single signature user account, or a network account owned by an account or managed with role-based access control). Network faucets get a zero fee schedule that the owner or a fee manager role can change after deployment.
- Add `miden-fungible` and `miden-non-fungible` commands to the CLI, tools and MCP App UI to the MCP server, AI assistant descriptions and schemas to `@openzeppelin/wizard-common`, and the Miden tab to the web Wizard.
