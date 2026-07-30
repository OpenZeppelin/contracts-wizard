---
'@openzeppelin/contracts-mcp': patch
---

Add MCP Apps interactive UIs for Wizard-backed generation tools.
- Each tool serves a fixed-kind Wizard controls + code preview App with Send Updates to Agent / Copy to Clipboard.
- Non-Apps clients still receive Markdown source from tools/call.
- **Potentially breaking changes**:
  - The internal `safePrintSolidityCodeBlock`, `safePrintCairoCodeBlock` and `safePrintRustCodeBlock` helpers are replaced by `codeBlock` and `formatPrintError`. These were never exported from the package entry point, so only deep imports into `dist/utils` are affected.
