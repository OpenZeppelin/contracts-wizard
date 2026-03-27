---
'@openzeppelin/wizard-common': minor
---

Move Zod schemas from MCP to common package, add `@openzeppelin/wizard-common/schemas` subpath export.
- Uniswap hooks: shorten prompt, move hook descriptions to field-level `describe()` on `--hook` parameter.
- Cairo `access` schema field changed from required to optional (loosens validation).
- Added `zod` as a dependency.
- **Breaking change**: Added `exports` field to package.json, restricting imports to declared subpaths (`.` and `./schemas`).
