---
'@openzeppelin/contracts-mcp': minor
---

Rename the `erc7984` tool to `confidential-erc7984`.
- **Breaking changes**: The tool previously named `erc7984` is now named `confidential-erc7984`, so it follows the documented `<language>-<contract>` tool naming format and matches the equivalent CLI command. The bare name dates from when the contract kind was `ConfidentialFungible`, where the prefix would have stuttered. Update any hardcoded references to the old name, including agent prompts, host configuration, and tests that assert the server's tool list. The tool's MCP Apps resource URI changes accordingly, from `ui://openzeppelin/erc7984.html` to `ui://openzeppelin/confidential-erc7984.html`.
