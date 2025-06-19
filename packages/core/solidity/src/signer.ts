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
  const fn = signerFunctions.initialize[signer];
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
  initialize: {
    ECDSA: {
      name: 'initialize',
      kind: 'public' as const,
      args: [{ name: 'signer', type: 'address' }],
    },
    P256: {
      name: 'initialize',
      kind: 'public' as const,
      args: [
        { name: 'qx', type: 'bytes32' },
        { name: 'qy', type: 'bytes32' },
      ],
    },
    RSA: {
      name: 'initialize',
      kind: 'public' as const,
      args: [
        { name: 'e', type: 'bytes memory' },
        { name: 'n', type: 'bytes memory' },
      ],
    },
    Multisig: {
      name: 'initialize',
      kind: 'public' as const,
      args: [
        { name: 'signers', type: 'bytes[] memory' },
        { name: 'threshold', type: 'uint256' },
      ],
    },
    MultisigWeighted: {
      name: 'initialize',
      kind: 'public' as const,
      args: [
        { name: 'signers', type: 'bytes[] memory' },
        { name: 'weights', type: 'uint256[] memory' },
        { name: 'threshold', type: 'uint256' },
      ],
    },
  },
  _rawSignatureValidation: {
    name: '_rawSignatureValidation',
    kind: 'internal' as const,
    args: [
      { name: 'hash', type: 'bytes32' },
      { name: 'signature', type: 'bytes calldata' },
    ],
    returns: ['bool'],
    mutability: 'view' as const,
  },
};
