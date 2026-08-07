---
'ui': patch
'@openzeppelin/contracts-mcp': patch
---

Shrink MCP App package size by sharing one HTML template per language.
- Inject contract kind at serve time instead of shipping near-duplicate HTML per tool.
- Scope MCP App Tailwind content away from web-only Wizard shells.
- Bundle the Zama logo so it renders in self-contained MCP Apps.
