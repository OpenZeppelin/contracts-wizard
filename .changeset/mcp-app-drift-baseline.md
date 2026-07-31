---
'@openzeppelin/contracts-mcp': patch
---

Fix MCP App false "preview differs" when Controls coerce required options.
- Snapshot the original-options baseline after UI settle (e.g. access → ownable) so implied defaults from the agent tool run are not treated as user edits.
