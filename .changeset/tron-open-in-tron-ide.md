---
'ui': patch
'@openzeppelin/contracts-mcp': patch
---

Open TRON contracts in TRON IDE instead of Remix.
- Build TRON IDE links with the base64 payloads unencoded in the hash, since its URL loader reads params raw.
- Disable the action for sources with non-ASCII characters, which TRON IDE's loader corrupts.
- Add a note on the action for upgradeable contracts, since TRON IDE does not deploy proxies.
- Pin the `@openzeppelin/tron-contracts` versions in the remappings param.
