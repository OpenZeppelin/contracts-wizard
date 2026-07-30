---
'@openzeppelin/wizard': patch
---

Add a Hardhat + viem development package download alongside the existing Hardhat + ethers option.
- Rename the existing Hardhat download label to Hardhat + ethers.
- Generated viem projects use `@nomicfoundation/hardhat-viem` (and Ignition viem for non-upgradeable contracts) or `@openzeppelin/hardhat-upgrades/viem` for upgradeable contracts.
