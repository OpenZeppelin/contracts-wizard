import type { ContractBuilder } from './contract';
import { defineFunctions } from './utils/define-functions';

export const SignerOptions = [false, 'ERC7702', 'ECDSA', 'P256', 'RSA'] as const;
export type SignerOptions = (typeof SignerOptions)[number];

export function addSigner(c: ContractBuilder, signer: SignerOptions): void {
  if (!signer) return;
  const parent = parents[signer];
  c.addParent(parent);
  c.addOverride({ name: parent.name }, signerFunctions._rawSignatureValidation);

  // ERC-7702 doesn't require initialization
  if (signer === 'ERC7702') return;

  c.addParent({
    name: 'Initializable',
    path: '@openzeppelin/contracts/proxy/utils/Initializable.sol',
  });
  const fn = signerFunctions[`initialize${signer}`];
  c.addModifier('initializer', fn);
  c.addFunctionCode(
    `_setSigner(${fn.args
      .map(({ name }) => name)
      .join(', ')
      .trimEnd()});`,
    fn,
  );
}

const parents = {
  ERC7702: {
    name: 'SignerERC7702',
    path: '@openzeppelin/community-contracts/contracts/utils/cryptography/SignerERC7702.sol',
  },
  ECDSA: {
    name: 'SignerECDSA',
    path: '@openzeppelin/community-contracts/contracts/utils/cryptography/SignerECDSA.sol',
  },
  P256: {
    name: 'SignerP256',
    path: '@openzeppelin/community-contracts/contracts/utils/cryptography/SignerP256.sol',
  },
  RSA: {
    name: 'SignerRSA',
    path: '@openzeppelin/community-contracts/contracts/utils/cryptography/SignerRSA.sol',
  },
};

export const signerFunctions = {
  ...defineFunctions({
    initializeECDSA: {
      kind: 'public' as const,
      args: [{ name: 'signer', type: 'address' }],
    },
    initializeP256: {
      kind: 'public' as const,
      args: [
        { name: 'qx', type: 'bytes32' },
        { name: 'qy', type: 'bytes32' },
      ],
    },
    initializeRSA: {
      kind: 'public' as const,
      args: [
        { name: 'e', type: 'bytes memory' },
        { name: 'n', type: 'bytes memory' },
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
  }),
};
