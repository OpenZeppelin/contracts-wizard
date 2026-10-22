---
'@openzeppelin/wizard': patch
---

Update dependencies in Hardhat, Hardhat Polkadot, Hardhat TRON, and TronBox sample project downloads.
- Hardhat Polkadot, Hardhat TRON, and TronBox sample projects add npm `overrides` to use newer versions of some transitive dependencies.
- Hardhat Polkadot sample project adds `typescript` as a dev dependency, since TypeScript 7 is incompatible with `ts-node` used by Hardhat 2.
