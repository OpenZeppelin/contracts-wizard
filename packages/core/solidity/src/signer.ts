import type { ContractBuilder } from './contract';
import { defineFunctions } from './utils/define-functions';

export const SignerOptions = [false, 'ERC7702', 'ECDSA', 'P256', 'RSA', 'Multisig', 'MultisigWeighted'] as const;
export type SignerOptions = (typeof SignerOptions)[number];

export function addSigner(c: ContractBuilder, signer: SignerOptions): void {
  if (!signer) return;

  c.addParent(signers[signer]);
  c.addOverride(
    { name: signer === 'MultisigWeighted' ? signers.Multisig.name : signers[signer].name },
    signerFunctions._rawSignatureValidation,
  );

  // ERC-7702 doesn't require initialization
  if (signer === 'ERC7702') return;

  c.addParent({
    name: 'Initializable',
    path: '@openzeppelin/contracts/proxy/utils/Initializable.sol',
  });

  // Add locking constructor
  c.addNatspecTag('@custom:oz-upgrades-unsafe-allow', 'constructor');
  c.addConstructorCode(`_disableInitializers();`);

  // Add initializer
  const fn = signerFunctions[`initialize${signer}`];
  c.addModifier('initializer', fn);

  switch (signer) {
    case 'Multisig':
      c.addFunctionCode(`_addSigners(${fn.args[0]!.name});`, fn);
      c.addFunctionCode(`_setThreshold(${fn.args[1]!.name});`, fn);
      break;
    case 'MultisigWeighted':
      c.addFunctionCode(`_addSigners(${fn.args[0]!.name});`, fn);
      c.addFunctionCode(`_setSignerWeights(${fn.args[0]!.name}, ${fn.args[1]!.name});`, fn);
      c.addFunctionCode(`_setThreshold(${fn.args[2]!.name});`, fn);
      break;
    case 'ECDSA':
    case 'P256':
    case 'RSA':
      c.addFunctionCode(`_setSigner(${fn.args.map(({ name }) => name).join(', ')});`, fn);
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

export const signerFunctions = defineFunctions({
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
  initializeMultisig: {
    kind: 'public' as const,
    args: [
      { name: 'signers', type: 'bytes[] memory' },
      { name: 'threshold', type: 'uint256' },
    ],
  },
  initializeMultisigWeighted: {
    kind: 'public' as const,
    args: [
      { name: 'signers', type: 'bytes[] memory' },
      { name: 'weights', type: 'uint256[] memory' },
      { name: 'threshold', type: 'uint256' },
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
