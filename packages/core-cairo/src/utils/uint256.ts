import BN from "bn.js";

/**
 * Returns Uint256 components for low and high bits based on a given number in string format.
 * @param num Number in string format
 * @returns Object with lowBits and highBits
 * @throws {NumberTooLarge} if the provided number is larger than 256 bits
 */
export function toUint256(num: string) {
  const bignum = new BN(num, 10);
  if (bignum.bitLength() > 256) { // 256 bits
    throw new NumberTooLarge();
  } else {
    const highBits = bignum.shrn(128);
    const lowBits = bignum.maskn(128);
    return {
      lowBits, highBits
    }
  }
}

export class NumberTooLarge extends Error {}
