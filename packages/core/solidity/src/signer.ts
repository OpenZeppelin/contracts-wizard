import type { ContractBuilder } from './contract';
import { OptionsError } from './error';
import type { Upgradeable } from './set-upgradeable';
import { defineFunctions } from './utils/define-functions';

export const SignerOptions = [
  false,
  'ECDSA',
  'EIP7702',
  'P256',
  'WebAuthn',
  'RSA',
  'Multisig',
  'MultisigWeighted',
] as const;
export type SignerOptions = (typeof SignerOptions)[number];

export function addSigner(c: ContractBuilder, signer: SignerOptions, upgradeable: Upgradeable): void {
  if (!signer) return;

  const signerName = signer === 'MultisigWeighted' ? signers.Multisig.name : signers[signer].name;
  c.addOverride({ name: signerName }, signerFunctions._rawSignatureValidation);

  switch (signer) {
    case 'EIP7702':
      c.addParent(signers[signer]);
      if (upgradeable) {
        throw new OptionsError({
          eip7702: 'EOAs can upgrade by redelegating to a new account',
          upgradeable: 'EOAs can upgrade by redelegating to a new account',
        });
      }
      break;
    case 'ECDSA':
    case 'P256':
    case 'RSA':
    case 'Multisig':
    case 'MultisigWeighted': {
      signerArgs[signer].forEach(arg => c.addConstructorArgument(arg));
      c.addParent(
        signers[signer],
        signerArgs[signer].map(arg => ({ lit: arg.name })),
      );
      break;
    }
    case 'WebAuthn': {
      signerArgs.P256.forEach(arg => c.addConstructorArgument(arg));
      c.addParent(
        signers.P256,
        signerArgs.P256.map(arg => ({ lit: arg.name })),
      );
      c.addParent(signers[signer]);
      c.addImportOnly({
        name: 'AbstractSigner',
        path: '@openzeppelin/contracts/utils/cryptography/signers/AbstractSigner.sol',
        transpiled: false,
      });
      c.addOverride({ name: 'AbstractSigner', transpiled: false }, signerFunctions._rawSignatureValidation);
      c.addOverride({ name: 'SignerP256' }, signerFunctions._rawSignatureValidation);
      break;
    }
  }
}

export const signers = {
  ECDSA: {
    name: 'SignerECDSA',
    path: '@openzeppelin/contracts/utils/cryptography/signers/SignerECDSA.sol',
  },
  EIP7702: {
    name: 'SignerEIP7702',
    path: '@openzeppelin/contracts/utils/cryptography/signers/SignerEIP7702.sol',
  },
  P256: {
    name: 'SignerP256',
    path: '@openzeppelin/contracts/utils/cryptography/signers/SignerP256.sol',
  },
  WebAuthn: {
    name: 'SignerWebAuthn',
    path: '@openzeppelin/contracts/utils/cryptography/signers/SignerWebAuthn.sol',
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

export const signerArgs: Record<Exclude<SignerOptions, false | 'EIP7702'>, { name: string; type: string }[]> = {
  ECDSA: [{ name: 'signer', type: 'address' }],
  P256: [
    { name: 'qx', type: 'bytes32' },
    { name: 'qy', type: 'bytes32' },
  ],
  RSA: [
    { name: 'e', type: 'bytes memory' },
    { name: 'n', type: 'bytes memory' },
  ],
  WebAuthn: [],
  Multisig: [
    { name: 'signers', type: 'bytes[] memory' },
    { name: 'threshold', type: 'uint64' },
  ],
  MultisigWeighted: [
    { name: 'signers', type: 'bytes[] memory' },
    { name: 'weights', type: 'uint64[] memory' },
    { name: 'threshold', type: 'uint64' },
  ],
};

export const signerFunctions = defineFunctions({
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
