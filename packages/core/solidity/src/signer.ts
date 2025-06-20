import type { ContractBuilder } from './contract';
import { defineFunctions } from './utils/define-functions';

export const SignerOptions = [false, 'ERC7702', 'ECDSA', 'P256', 'RSA', 'Multisig', 'MultisigWeighted'] as const;
export type SignerOptions = (typeof SignerOptions)[number];

export function addSigner(c: ContractBuilder, signer: SignerOptions): void {
  // Add parent, and constructor/initializer logic
  switch(signer) {
    case false:
      return;
    case 'ERC7702':
    {
      c.addParent(signers[signer]);
      break;
    }
    case 'ECDSA':
    case 'P256':
    case 'RSA':
    case 'Multisig':
    case 'MultisigWeighted':
    {
      // TODO: support upgradeable here ?
      const { args } = signerFunctions[signer];
      args.forEach(arg => c.addConstructorArgument(arg));
      c.addParent(signers[signer], args.map(arg => ({ lit: arg.name })));
      break;
    }
  }

  // override
  c.addOverride(
    { name: signer === 'MultisigWeighted' ? signers.Multisig.name : signers[signer].name },
    signerFunctions._rawSignatureValidation,
  );
}

export const signers = {
  ERC7702: {
    name: 'SignerERC7702',
    path: '@openzeppelin/contracts/utils/cryptography/signers/SignerERC7702.sol',
  },
  ECDSA: {
    name: 'SignerECDSA',
    path: '@openzeppelin/contracts/utils/cryptography/signers/SignerECDSA.sol',
  },
  P256: {
    name: 'SignerP256',
    path: '@openzeppelin/contracts/utils/cryptography/signers/SignerP256.sol',
  },
  RSA: {
    name: 'SignerRSA',
    path: '@openzeppelin/contracts/utils/cryptography/signers/SignerRSA.sol',
  },
  Multisig: {
    name: 'MultiSignerERC7913',
    path: '@openzeppelin/contracts/utils/cryptography/signers/MultiSignerERC7913.sol',
  },
  MultisigWeighted: {
    name: 'MultiSignerERC7913Weighted',
    path: '@openzeppelin/contracts/utils/cryptography/signers/MultiSignerERC7913Weighted.sol',
  },
};

export const signerFunctions = defineFunctions({
  ECDSA: {
    kind: 'public' as const,
    args: [{ name: 'signer', type: 'address' }],
  },
  P256: {
    kind: 'public' as const,
    args: [
      { name: 'qx', type: 'bytes32' },
      { name: 'qy', type: 'bytes32' },
    ],
  },
  RSA: {
    kind: 'public' as const,
    args: [
      { name: 'e', type: 'bytes memory' },
      { name: 'n', type: 'bytes memory' },
    ],
  },
  Multisig: {
    kind: 'public' as const,
    args: [
      { name: 'signers', type: 'bytes[] memory' },
      { name: 'threshold', type: 'uint64' },
    ],
  },
  MultisigWeighted: {
    kind: 'public' as const,
    args: [
      { name: 'signers', type: 'bytes[] memory' },
      { name: 'weights', type: 'uint64[] memory' },
      { name: 'threshold', type: 'uint64' },
    ],
  },
  _rawSignatureValidation: {
    kind: 'internal' as const,
    args: [
      { name: 'hash', type: 'bytes32' },
      { name: 'signature', type: 'bytes calldata' },
    ],
    returns: ['bool'],
    mutability: 'view' as const,
  },
});
