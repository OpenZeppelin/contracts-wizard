import { OptionsError } from '../error';

function maxValueOfUint(bits: number): bigint {
  if (bits <= 0) {
    throw new Error(`Number of bits must be positive (actual '${bits}').`);
  }
  if (bits % 8 !== 0) {
    throw new Error(`The number of bits must be a multiple of 8 (actual '${bits}').`);
  }
  const bytes = bits / 8;
  return BigInt('0x' + 'ff'.repeat(bytes));
}

const UINT_MAX_VALUES = {
  uint8: maxValueOfUint(8),
  uint16: maxValueOfUint(16),
  uint32: maxValueOfUint(32),
  uint64: maxValueOfUint(64),
  uint128: maxValueOfUint(128),
  uint256: maxValueOfUint(256),
} as const;

export type UintType = keyof typeof UINT_MAX_VALUES;

export const UINT256_MAX = UINT_MAX_VALUES.uint256;

/**
 * Checks that a string is a valid number, and convert to bigint.
 *
 * @param value The string value to check and convert.
 * @param field The field name to use in the error message if the value is invalid.
 * @throws OptionsError if the value is not a valid number.
 * @returns The validated value as a bigint.
 */
export function toBigInt(value: string, field: string): bigint {
  const isValidNumber = /^\d+$/.test(value);
  if (!isValidNumber) {
    throw new OptionsError({
      [field]: 'Not a valid number',
    });
  }
  return BigInt(value);
}

/**
 * Checks that a string is a valid number, and fits within the given `uint` type.
 *
 * @param value The value to check.
 * @param field The field name to use in the error if the value is invalid.
 * @param type The Solidity `uint` type the value must fit within.
 * @throws OptionsError if the value is not a valid number or is greater than the maximum value for the given type.
 * @returns The value as a bigint.
 */
export function toUint(value: string, field: string, type: UintType): bigint {
  const numValue = toBigInt(value, field);
  if (numValue > UINT_MAX_VALUES[type]) {
    throw new OptionsError({
      [field]: `Value is greater than ${type} max value`,
    });
  }
  return numValue;
}
