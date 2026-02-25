import { OptionsError } from '../error';

export const UINT256_MAX = BigInt(2) ** BigInt(256) - BigInt(1);

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
 * Checks that a bigint value fits within `uint256`.
 *
 * @param numValue The value to check.
 * @param field The field name to use in the error if the value is invalid.
 * @throws OptionsError if the value is greater than the maximum value for `uint256`.
 * @returns The value as a bigint.
 */
export function validateUint256(numValue: bigint, field: string): bigint {
  if (numValue > UINT256_MAX) {
    throw new OptionsError({
      [field]: 'Value is greater than uint256 max value',
    });
  }
  return numValue;
}

/**
 * Checks that a string is a valid number, and fits within `uint256`.
 * Convenience function that calls `toBigInt` and `validateUint256`.
 *
 * @param value The value to check.
 * @param field The field name to use in the error if the value is invalid.
 * @throws OptionsError if the value is not a valid number or is greater than the maximum value for `uint256`.
 * @returns The value as a bigint.
 */
export function toUint256(value: string, field: string): bigint {
  return validateUint256(toBigInt(value, field), field);
}
