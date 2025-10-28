import { keccak256 } from '@ethersproject/keccak256';
import { toUtf8Bytes } from '@ethersproject/strings';
import { arrayify } from '@ethersproject/bytes';

/**
 * Returns the ERC-7201 storage location for a given namespace id
 */
export function computeNamespacedStorageSlot(id: string): string {
  const innerHash = keccak256(toUtf8Bytes(id));

  const minusOne = BigInt(innerHash) - 1n;

  const minusOneHex = '0x' + minusOne.toString(16).padStart(64, '0');
  const minusOneBytes = arrayify(minusOneHex);

  const outerHash = keccak256(minusOneBytes);

  const mask = 0xffn;
  const masked = BigInt(outerHash) & ~mask;

  return '0x' + masked.toString(16).padStart(64, '0');
}
