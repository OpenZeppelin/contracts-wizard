---
'@openzeppelin/wizard': patch
'@openzeppelin/wizard-cairo': patch
'@openzeppelin/wizard-stellar': patch
'@openzeppelin/wizard-stylus': patch
---

Reject line terminators in `info.securityContact` and `info.license` to prevent breaking out of the generated comment lines. Fixes [GHSA-9wxg-vf3r-56hc](https://github.com/OpenZeppelin/contracts-wizard/security/advisories/GHSA-9wxg-vf3r-56hc).
