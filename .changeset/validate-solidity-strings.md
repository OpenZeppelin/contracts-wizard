---
'@openzeppelin/wizard': patch
'@openzeppelin/wizard-confidential': patch
'@openzeppelin/wizard-uniswap-hooks': patch
---

Reject Solidity option strings that contain ASCII controls, Unicode line terminators, or unpaired surrogates at build entry points (`buildERC20`, `buildERC721`, `buildERC1155`, `buildGovernor`, `buildAccount`, `buildCustom`, `buildERC7984`, `buildHooks`), so failures surface as `OptionsError` instead of non-compiling output.
