import keccak from 'keccak';

export function getNamespacedStorageName(name: string) {
  return `myProject.${name}`;
}

export function generateNamespacesStorageSlot(inputString: string): string {
  const innerHash = keccak('keccak256').update(inputString).digest('hex');
  const innerNum = BigInt('0x' + innerHash) - BigInt(1);

  const encoded = padTo32Bytes(innerNum);

  const outerHashBuffer = keccak('keccak256').update(encoded).digest();
  const outerHash = BigInt('0x' + outerHashBuffer.toString('hex'));

  const masked = outerHash & ~BigInt(0xff);

  return '0x' + masked.toString(16).padStart(64, '0');
}

function padTo32Bytes(b: bigint): Buffer {
  let hex = b.toString(16);
  if (hex.length > 64) throw new Error('Value too large for uint256');
  hex = hex.padStart(64, '0');
  return Buffer.from(hex, 'hex');
}
