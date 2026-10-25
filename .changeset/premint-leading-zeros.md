---
'@openzeppelin/wizard': patch
---

Fix premint amounts below 1, such as `0.05`, generating a number literal with a leading zero that does not compile.
