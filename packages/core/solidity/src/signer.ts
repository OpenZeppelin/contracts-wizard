import type { ContractBuilder } from './contract';
import { OptionsError } from './error';
import type { Upgradeable } from './set-upgradeable';
import { defineFunctions } from './utils/define-functions';

export const SignerOptions = [false, 'ERC7702', 'ECDSA', 'P256', 'RSA', 'Multisig', 'MultisigWeighted'] as const;
export type SignerOptions = (typeof SignerOptions)[number];

export function addSigner(c: ContractBuilder, signer: SignerOptions, upgradeable: Upgradeable): void {
  if (!signer) return;

  const signerName = signer === 'MultisigWeighted' ? signers.Multisig.name : signers[signer].name;
  c.addOverride({ name: signerName }, signerFunctions._rawSignatureValidation);

  switch (signer) {
    case 'ERC7702':
      c.addParent(signers[signer]);
      if (upgradeable) {
        throw new OptionsError({
          erc7702: 'EOAs can upgrade by redelegating to a new account',
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
  }
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

export const signerArgs: Record<Exclude<SignerOptions, false | 'ERC7702'>, { name: string; type: string }[]> = {
  ECDSA: [{ name: 'signer', type: 'address' }],
  P256: [
    { name: 'qx', type: 'bytes32' },
    { name: 'qy', type: 'bytes32' },
  ],
  RSA: [
    { name: 'e', type: 'bytes memory' },
    { name: 'n', type: 'bytes memory' },
  ],
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
