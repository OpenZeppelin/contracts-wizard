---
'@openzeppelin/wizard-miden': minor
'@openzeppelin/wizard-common': minor
'@openzeppelin/contracts-cli': minor
'@openzeppelin/contracts-mcp': minor
'ui': minor
---

Add Miden as a new Wizard language with `Fungible` and `NonFungible` faucet accounts.
- New `@openzeppelin/wizard-miden` package generating Rust code that composes the standard account components of the Miden protocol (`miden-protocol` and `miden-standards` crates, version 0.17) into a fungible or non-fungible faucet account.
- Options: token metadata (name, symbol, decimals, max supply, description, logo URI, external link or contract URI, updatable description and URIs, updatable max supply), burn policy (any holder, minimum amount or owner only), pausable (optionally including transfers), transfer policy (allowlist or blocklist), switchable transfer policy and access control (Single Key user account, or a network account managed by an owner or with role-based access control). Network faucets get a zero fee schedule that the owner or a fee manager role can change after deployment.
- Add `miden-fungible` and `miden-non-fungible` commands to the CLI, tools and MCP App UI to the MCP server, AI assistant descriptions and schemas to `@openzeppelin/wizard-common`, and the Miden tab to the web Wizard.
