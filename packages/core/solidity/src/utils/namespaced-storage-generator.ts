import { keccak256 } from 'ethereum-cryptography/keccak';
import { hexToBytes, toHex, utf8ToBytes } from 'ethereum-cryptography/utils';

export function getNamespaceId(name: string, namespace: string = 'myProject') {
  return `${namespace}.${name}`;
}

/**
 * Returns the ERC-7201 storage location for a given namespace id
 */
export function computeNamespacedStorageSlot(id: string): string {
  const innerHash = keccak256(utf8ToBytes(id));
  const minusOne = BigInt('0x' + toHex(innerHash)) - 1n;
  const minusOneBytes = hexToBytes(minusOne.toString(16).padStart(64, '0'));

  const outerHash = keccak256(minusOneBytes);

  const mask = BigInt('0xff');
  const masked = BigInt('0x' + toHex(outerHash)) & ~mask;

  return '0x' + masked.toString(16).padStart(64, '0');
}
