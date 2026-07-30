---
'@openzeppelin/contracts-mcp': minor
---

Rename the `erc7984` tool to `confidential-erc7984`.

**Breaking:** the tool was the only one that did not follow the documented `<language>-<contract>` naming format, so agents and configurations referring to `erc7984` must be updated. The name predates the rename of the contract kind from `ConfidentialFungible` to `ERC7984`, when the `confidential-` prefix would have stuttered.
