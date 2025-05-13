import type { ContractBuilder } from './contract';
import { defineFunctions } from './utils/define-functions';

export const SignerOptions = [false, 'ERC7702', 'ECDSA', 'P256', 'RSA', 'Multisig', 'MultisigWeighted'] as const;
export type SignerOptions = (typeof SignerOptions)[number];

export function addSigner(c: ContractBuilder, signer: SignerOptions): void {
  if (!signer) return;
  const parent = signers[signer];
  const name = parent.name;
  c.addParent(parent);
  c.addOverride(
    { name: name === signers.MultisigWeighted.name ? signers.Multisig.name : name },
    signerFunctions._rawSignatureValidation,
  );

  // ERC-7702 doesn't require initialization
  if (signer === 'ERC7702') return;

  c.addParent({
    name: 'Initializable',
    path: '@openzeppelin/contracts/proxy/utils/Initializable.sol',
  });
  const fn = signerFunctions[`initialize${signer}`];
  c.addModifier('initializer', fn);

  const args = fn.args;

  switch (signer) {
    case 'Multisig':
      c.addFunctionCode(`_addSigners(${args[0]!.name});`, fn);
      c.addFunctionCode(`_setThreshold(${args[1]!.name});`, fn);
      break;
    case 'MultisigWeighted':
      c.addFunctionCode(`_addSigners(${args[0]!.name});`, fn);
      c.addFunctionCode(`_setSignerWeights(${args[0]!.name}, ${args[1]!.name});`, fn);
      c.addFunctionCode(`_setThreshold(${args[2]!.name});`, fn);
      break;
    case 'ECDSA':
    case 'P256':
    case 'RSA':
      c.addFunctionCode(
        `_setSigner(${fn.args
          .map(({ name }) => name)
          .join(', ')
          .trimEnd()});`,
        fn,
      );
  }
}

export const signers = {
  ERC7702: {
    name: 'SignerERC7702',
    path: '@openzeppelin/community-contracts/utils/cryptography/SignerERC7702.sol',
  },
  ECDSA: {
    name: 'SignerECDSA',
    path: '@openzeppelin/community-contracts/utils/cryptography/SignerECDSA.sol',
  },
  P256: {
    name: 'SignerP256',
    path: '@openzeppelin/community-contracts/utils/cryptography/SignerP256.sol',
  },
  RSA: {
    name: 'SignerRSA',
    path: '@openzeppelin/community-contracts/utils/cryptography/SignerRSA.sol',
  },
  Multisig: {
    name: 'MultiSignerERC7913',
    path: '@openzeppelin/community-contracts/utils/cryptography/MultiSignerERC7913.sol',
  },
  MultisigWeighted: {
    name: 'MultiSignerERC7913Weighted',
    path: '@openzeppelin/community-contracts/utils/cryptography/MultiSignerERC7913Weighted.sol',
  },
};

export const signerFunctions = {
  ...defineFunctions({
    initializeECDSA: {
      kind: 'public' as const,
      args: [{ name: 'signer', type: 'address' }],
      comments: [
        '/// @dev Initializes the contract with an ECDSA signer',
        '/// @param signer The address of the ECDSA signer',
      ],
    },
    initializeP256: {
      kind: 'public' as const,
      args: [
        { name: 'qx', type: 'bytes32' },
        { name: 'qy', type: 'bytes32' },
      ],
      comments: [
        '/// @dev Initializes the contract with a P-256 signer',
        '/// @param qx The x-coordinate of the public key',
        '/// @param qy The y-coordinate of the public key',
      ],
    },
    initializeRSA: {
      kind: 'public' as const,
      args: [
        { name: 'e', type: 'bytes memory' },
        { name: 'n', type: 'bytes memory' },
      ],
      comments: [
        '/// @dev Initializes the contract with an RSA signer',
        '/// @param e The RSA public exponent',
        '/// @param n The RSA modulus',
      ],
    },
    initializeMultisig: {
      kind: 'public' as const,
      args: [
        { name: 'signers', type: 'bytes[] memory' },
        { name: 'threshold', type: 'uint256' },
      ],
      comments: [
        '/// @dev Initializes the contract with a multisig configuration',
        '/// @param signers Array of signer data',
        '/// @param threshold The minimum number of required signatures',
      ],
    },
    initializeMultisigWeighted: {
      kind: 'public' as const,
      args: [
        { name: 'signers', type: 'bytes[] memory' },
        { name: 'weights', type: 'uint256[] memory' },
        { name: 'threshold', type: 'uint256' },
      ],
      comments: [
        '/// @dev Initializes the contract with a weighted multisig configuration',
        '/// @param signers Array of signer data',
        '/// @param weights Array of weights for each signer',
        '/// @param threshold The minimum total weight required for valid signatures',
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
      comments: [
        '/// @dev Performs raw signature validation',
        '/// @param hash The hash to validate the signature for',
        '/// @param signature The signature to validate',
        '/// @return True if the signature is valid, false otherwise',
      ],
    },
  }),
};
