---
'@openzeppelin/wizard-stellar': patch
'@openzeppelin/wizard-common': patch
'@openzeppelin/contracts-mcp': patch
'@openzeppelin/contracts-cli': patch
---

Add Stellar `Account` contract type implementing the smart account framework, combining Delegated, Ed25519 and WebAuthn (passkey) signers with an optional threshold policy.
- Each enabled signer type contributes its own typed constructor arguments, which the constructor assembles into a single `Vec<Signer>` in a fixed order (delegated, Ed25519, WebAuthn).
- Authorization is either n-of-n (no policy), a simple threshold (m-of-n multisig), or a weighted threshold whose `weights` argument is positionally aligned with the assembled signer order.
- Verifier addresses, policy addresses and the threshold are deployment arguments rather than baked-in constants, so a single build works on any network. The generated code points at the Stellar Registry (https://testnet.rgstry.xyz and https://stellar.rgstry.xyz) as a place to look for verifier and policy contracts, leaving the choice of which to trust to whoever deploys.
- Adds an execution entry point option, which lets the account call contracts it owns such as its own policies, and an upgradeable option authorized by the account itself.
- The Account type has no access control or explicit trait implementation options, since every `SmartAccount` method authorizes through the account's own context rules.
