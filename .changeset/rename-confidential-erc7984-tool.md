---
'@openzeppelin/contracts-mcp': minor
---

Rename the `erc7984` tool to `confidential-erc7984`, so it follows the documented `<language>-<contract>` tool naming format and matches the equivalent CLI command. The bare name dates from when the contract kind was `ConfidentialFungible`, where the prefix would have stuttered.
- **Potentially breaking changes**:
  - Clients that list tools from the server pick up the new name automatically. Hardcoded references to `erc7984` — in agent prompts, host configuration files, or scripts — need to be updated.
  - The tool's MCP Apps resource URI changes from `ui://openzeppelin/erc7984.html` to `ui://openzeppelin/confidential-erc7984.html`. Hosts resolve this from the tool's `_meta`, so no client change is required.
